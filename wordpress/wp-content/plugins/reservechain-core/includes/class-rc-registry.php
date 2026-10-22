<?php
if (!defined('ABSPATH')) { exit; }
class RC_Registry {
    public static function table(){ global $wpdb; return $wpdb->prefix.'rc_assets'; }
    public static function all_public(){ global $wpdb; return $wpdb->get_results("SELECT * FROM ".self::table()." WHERE publication_state='published' ORDER BY id ASC", ARRAY_A); }
    public static function by_slug($slug){ global $wpdb; return $wpdb->get_row($wpdb->prepare("SELECT * FROM ".self::table()." WHERE slug=%s AND publication_state='published'", sanitize_title($slug)), ARRAY_A); }
    public static function by_passport($passport){ global $wpdb; return $wpdb->get_row($wpdb->prepare("SELECT * FROM ".self::table()." WHERE passport_id=%s AND publication_state='published'", sanitize_text_field($passport)), ARRAY_A); }
    public static function update($id,$fields,$reason='',$publication_authorized=false){
        global $wpdb; $table=self::table(); $id=(int)$id; $before=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id=%d",$id),ARRAY_A); if(!$before)return false;
        if (!is_string($reason) || trim($reason)==='') return new WP_Error('reason_required','A reason for the proposed change is required.');
        $states=['draft','under_review','approved','published','unpublished','archived'];
        $proposed=isset($fields['publication_state']) ? sanitize_key($fields['publication_state']) : $before['publication_state'];
        if (!in_array($proposed,$states,true)) return new WP_Error('invalid_publication_state','Invalid publication state.');
        $publicFields=['name','lot_id','purity','diameter','certificate_no','certificate_date','laboratory','verification_status','custody_status','reserve_status','tokenization_status','evidence_note'];
        $publicChanged=false;
        foreach($publicFields as $key) if(array_key_exists($key,$fields) && (string)$fields[$key] !== (string)$before[$key]) { $publicChanged=true; break; }
        $needsReview=($proposed==='published' && ($before['publication_state']!=='published' || $publicChanged)) ||
                     ($before['publication_state']==='published' && $publicChanged);
        if($needsReview && (!$publication_authorized || !current_user_can('rc_review_assets'))) {
            return new WP_Error('publication_review_required','Published asset changes require an independent checker and explicit owner publication authorization.');
        }
        if($publication_authorized && !current_user_can('rc_review_assets')) {
            return new WP_Error('checker_required','Only an authorized reviewer may apply a checked publication.');
        }
        $allowed=['name','lot_id','purity','diameter','certificate_no','certificate_date','laboratory','publication_state','verification_status','custody_status','reserve_status','tokenization_status','evidence_note'];
        $clean=[]; foreach($allowed as $k) if(array_key_exists($k,$fields)) $clean[$k]=sanitize_textarea_field($fields[$k]);
        $clean['updated_at']=gmdate('Y-m-d H:i:s'); $wpdb->update($table,$clean,['id'=>$id]); $after=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id=%d",$id),ARRAY_A);
        RC_Audit::append('asset_updated','asset',$id,$before,$after,$reason); return $after;
    }
}
