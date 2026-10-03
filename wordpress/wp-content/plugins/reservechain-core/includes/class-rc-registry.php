<?php
if (!defined('ABSPATH')) { exit; }
class RC_Registry {
    public static function table(){ global $wpdb; return $wpdb->prefix.'rc_assets'; }
    public static function all_public(){ global $wpdb; return $wpdb->get_results("SELECT * FROM ".self::table()." WHERE publication_state='published' ORDER BY id ASC", ARRAY_A); }
    public static function by_slug($slug){ global $wpdb; return $wpdb->get_row($wpdb->prepare("SELECT * FROM ".self::table()." WHERE slug=%s AND publication_state='published'", sanitize_title($slug)), ARRAY_A); }
    public static function by_passport($passport){ global $wpdb; return $wpdb->get_row($wpdb->prepare("SELECT * FROM ".self::table()." WHERE passport_id=%s AND publication_state='published'", sanitize_text_field($passport)), ARRAY_A); }
    public static function update($id,$fields,$reason=''){
        global $wpdb; $table=self::table(); $id=(int)$id; $before=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id=%d",$id),ARRAY_A); if(!$before)return false;
        $allowed=['name','lot_id','purity','diameter','certificate_no','certificate_date','laboratory','publication_state','verification_status','custody_status','reserve_status','tokenization_status','evidence_note'];
        $clean=[]; foreach($allowed as $k) if(array_key_exists($k,$fields)) $clean[$k]=sanitize_textarea_field($fields[$k]);
        $clean['updated_at']=gmdate('Y-m-d H:i:s'); $wpdb->update($table,$clean,['id'=>$id]); $after=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id=%d",$id),ARRAY_A);
        RC_Audit::append('asset_updated','asset',$id,$before,$after,$reason); return $after;
    }
}
