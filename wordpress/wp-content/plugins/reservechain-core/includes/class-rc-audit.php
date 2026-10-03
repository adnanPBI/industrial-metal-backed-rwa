<?php
if (!defined('ABSPATH')) { exit; }
class RC_Audit {
    public static function table() { global $wpdb; return $wpdb->prefix . 'rc_audit'; }
    private static function stable_json($value) {
        if (is_array($value)) {
            if (array_keys($value) !== range(0, count($value)-1)) { ksort($value); }
            foreach ($value as $k => $v) { $value[$k] = self::stable_json_value($v); }
        }
        return wp_json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    private static function stable_json_value($v) {
        if (!is_array($v)) { return $v; }
        if (array_keys($v) !== range(0, count($v)-1)) { ksort($v); }
        foreach ($v as $k => $x) { $v[$k] = self::stable_json_value($x); }
        return $v;
    }
    public static function append($action, $record_type, $record_id, $before = null, $after = null, $reason = '', $actor_user_id = null) {
        global $wpdb;
        $table = self::table();
        $prev = $wpdb->get_var("SELECT event_hash FROM {$table} ORDER BY id DESC LIMIT 1");
        $prev = $prev ?: str_repeat('0', 64);
        $actor = $actor_user_id === null ? get_current_user_id() : (int)$actor_user_id;
        $created = gmdate('Y-m-d H:i:s');
        $payload = [
            'actor_user_id' => $actor, 'action' => $action, 'record_type' => $record_type,
            'record_id' => (string)$record_id, 'before_json' => $before, 'after_json' => $after,
            'reason' => $reason, 'created_at' => $created, 'prev_hash' => $prev,
        ];
        $event_hash = hash('sha256', $prev . '|' . self::stable_json($payload));
        $wpdb->insert($table, [
            'actor_user_id'=>$actor, 'action'=>$action, 'record_type'=>$record_type, 'record_id'=>(string)$record_id,
            'before_json'=>$before === null ? null : wp_json_encode($before), 'after_json'=>$after === null ? null : wp_json_encode($after),
            'reason'=>$reason, 'prev_hash'=>$prev, 'event_hash'=>$event_hash, 'created_at'=>$created,
        ], ['%d','%s','%s','%s','%s','%s','%s','%s','%s','%s']);
        return $event_hash;
    }
    public static function verify_chain() {
        global $wpdb; $rows = $wpdb->get_results('SELECT * FROM ' . self::table() . ' ORDER BY id ASC', ARRAY_A);
        $prev = str_repeat('0', 64);
        foreach ($rows as $row) {
            $payload = [
                'actor_user_id'=>(int)$row['actor_user_id'], 'action'=>$row['action'], 'record_type'=>$row['record_type'],
                'record_id'=>$row['record_id'], 'before_json'=>$row['before_json'] ? json_decode($row['before_json'], true) : null,
                'after_json'=>$row['after_json'] ? json_decode($row['after_json'], true) : null, 'reason'=>$row['reason'],
                'created_at'=>$row['created_at'], 'prev_hash'=>$row['prev_hash'],
            ];
            $expected = hash('sha256', $prev . '|' . self::stable_json($payload));
            if (!hash_equals($prev, $row['prev_hash']) || !hash_equals($expected, $row['event_hash'])) { return false; }
            $prev = $row['event_hash'];
        }
        return true;
    }
}
