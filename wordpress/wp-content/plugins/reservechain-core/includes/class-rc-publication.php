<?php
if (!defined('ABSPATH')) { exit; }
/**
 * Non-destructive publication maker/checker queue.
 * This class extends the existing rc_assets schema; it does not replace it.
 * Approvals remain disabled unless the owner explicitly sets RC_ALLOW_EVIDENCE_PUBLICATION.
 */
class RC_Publication {
    public static function init(){
        add_action('admin_post_rc_review_publication',[__CLASS__,'review']);
        add_action('admin_menu',[__CLASS__,'menu']);
    }
    public static function table(){ global $wpdb; return $wpdb->prefix . 'rc_publication_requests'; }
    public static function menu(){
        add_submenu_page('reservechain','Publication Reviews','Publication Reviews','rc_review_assets','rc-publication-review',[__CLASS__,'page']);
    }
    public static function submit_or_apply($id,array $fields,$reason){
        global $wpdb;
        if(!current_user_can('rc_edit_assets')) return new WP_Error('forbidden','Asset-edit capability required.');
        if(!is_string($reason) || trim($reason)==='') return new WP_Error('reason_required','Reason is mandatory.');
        $id=(int)$id;
        $before=$wpdb->get_row($wpdb->prepare("SELECT * FROM ".RC_Registry::table()." WHERE id=%d",$id),ARRAY_A);
        if(!$before) return new WP_Error('not_found','Asset does not exist.');
        $newState=sanitize_key($fields['publication_state']??$before['publication_state']);
        if(!in_array($newState,['draft','under_review','approved','published','unpublished','archived'],true)) return new WP_Error('invalid_state','Invalid state.');
        // Published changes, including assay/custody evidence edits, must not bypass checker review.
        $materialKeys=['purity','diameter','verification_status','custody_status','reserve_status','tokenization_status'];
        $materialChange=false;
        foreach($materialKeys as $key) if(isset($fields[$key]) && (string)$fields[$key] !== (string)$before[$key]) $materialChange=true;
        if($newState==='published' || ($before['publication_state']==='published' && $materialChange)) {
            $clean=[];
            foreach(['purity','diameter','verification_status','custody_status','reserve_status','tokenization_status','publication_state'] as $key){
                if(array_key_exists($key,$fields)) $clean[$key]=sanitize_textarea_field((string)$fields[$key]);
            }
            // A changed published record cannot stay published after a material edit request.
            if($materialChange && $before['publication_state']==='published') {
                $unpublish=RC_Registry::update($id,['publication_state'=>'under_review'],'Material change submitted for independent review');
                if(is_wp_error($unpublish) || !$unpublish) return new WP_Error('unpublish_failed','Unable to withdraw published asset safely.');
                $before=$wpdb->get_row($wpdb->prepare("SELECT * FROM ".RC_Registry::table()." WHERE id=%d",$id),ARRAY_A);
            }
            $clean['publication_state']='published';
            $fingerprint=hash('sha256',wp_json_encode($before));
            $inserted=$wpdb->insert(self::table(),[
                'asset_id'=>$id,'maker_user_id'=>get_current_user_id(),'proposed_json'=>wp_json_encode($clean),
                'previous_hash'=>$fingerprint,'maker_reason'=>sanitize_textarea_field($reason),
                'status'=>'pending','created_at'=>gmdate('Y-m-d H:i:s')
            ]);
            if(!$inserted) return new WP_Error('queue_failed','Review queue unavailable. Publication was not approved.');
            RC_Audit::append('publication_proposed','asset',$id,$before,['queue_id'=>(int)$wpdb->insert_id,'proposed'=>$clean],$reason);
            return ['status'=>'pending_review','queue_id'=>$wpdb->insert_id];
        }
        return RC_Registry::update($id,$fields,$reason);
    }
    public static function page(){
        if(!current_user_can('rc_review_assets')) wp_die('Forbidden');
        global $wpdb;
        $rows=$wpdb->get_results("SELECT * FROM ".self::table()." WHERE status='pending' ORDER BY id ASC LIMIT 100",ARRAY_A);
        echo '<div class="wrap"><h1>Asset Publication Review</h1><p>Independent approval requires evidence authorization. Live publishing is disabled by default.</p>';
        foreach($rows as $r){
            echo '<div class="card" style="padding:16px;margin:12px 0"><p><strong>Request '.(int)$r['id'].'</strong> · Asset '.(int)$r['asset_id'].' · Maker '.(int)$r['maker_user_id'].'</p>';
            echo '<p>'.esc_html($r['maker_reason']).'</p><form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';
            wp_nonce_field('rc_review_pub_'.$r['id']);
            echo '<input type="hidden" name="action" value="rc_review_publication"><input type="hidden" name="id" value="'.(int)$r['id'].'">';
            echo '<label>Owner approval reference <input class="regular-text" name="approval_ref" required></label> ';
            echo '<label>Review reason <input class="regular-text" name="review_reason" required></label> ';
            echo '<button class="button button-primary" name="decision" value="approve">Approve</button> ';
            echo '<button class="button" name="decision" value="reject">Reject</button></form></div>';
        }
        echo '</div>';
    }
    public static function review(){
        if(!current_user_can('rc_review_assets')) wp_die('Forbidden');
        global $wpdb;
        $id=(int)($_POST['id']??0);
        check_admin_referer('rc_review_pub_'.$id);
        $decision=sanitize_key(wp_unslash($_POST['decision']??''));
        $ref=sanitize_text_field(wp_unslash($_POST['approval_ref']??''));
        $reason=sanitize_textarea_field(wp_unslash($_POST['review_reason']??''));
        if(!in_array($decision,['approve','reject'],true) || $reason==='') wp_die('Invalid review.');
        // Lock queue + asset as one transaction so two reviewers cannot both authorize.
        $wpdb->query('START TRANSACTION');
        $r=$wpdb->get_row($wpdb->prepare("SELECT * FROM ".self::table()." WHERE id=%d FOR UPDATE",$id),ARRAY_A);
        if(!$r || $r['status']!=='pending') {
            $wpdb->query('ROLLBACK'); wp_die('Request already handled.');
        }
        if((int)$r['maker_user_id']===get_current_user_id()) {
            $wpdb->query('ROLLBACK'); wp_die('Maker and checker must be different users.');
        }
        $asset=$wpdb->get_row($wpdb->prepare("SELECT * FROM ".RC_Registry::table()." WHERE id=%d FOR UPDATE",(int)$r['asset_id']),ARRAY_A);
        if(!$asset || !hash_equals($r['previous_hash'],hash('sha256',wp_json_encode($asset)))) {
            $wpdb->query('ROLLBACK'); wp_die('Asset changed since request; re-submit review.');
        }
        if($decision==='approve'){
            if(!(defined('RC_ALLOW_EVIDENCE_PUBLICATION') && RC_ALLOW_EVIDENCE_PUBLICATION)){
                $wpdb->query('ROLLBACK'); wp_die('Owner authorization gate disabled.');
            }
            if($ref==='') { $wpdb->query('ROLLBACK'); wp_die('Owner approval reference is mandatory.'); }
            $proposal=json_decode($r['proposed_json'],true);
            if(!is_array($proposal) || ($proposal['publication_state']??'')!=='published') {
                $wpdb->query('ROLLBACK'); wp_die('Malformed approval request.');
            }
            $result=RC_Registry::update((int)$r['asset_id'],$proposal,'Checker approval '.$ref.': '.$reason,true);
            if(is_wp_error($result) || !$result) {
                $wpdb->query('ROLLBACK'); wp_die('Registry publication failed.');
            }
        }
        $affected=$wpdb->update(self::table(),[
            'checker_user_id'=>get_current_user_id(),'checker_reason'=>$reason,
            'owner_approval_ref'=>$ref,'status'=>$decision==='approve'?'approved':'rejected',
            'reviewed_at'=>gmdate('Y-m-d H:i:s')
        ],['id'=>$id,'status'=>'pending']);
        if($affected!==1) { $wpdb->query('ROLLBACK'); wp_die('Unable to complete review.'); }
        RC_Audit::append('publication_'.$decision,'asset',$r['asset_id'],['queue_id'=>$id],['owner_approval_ref'=>$ref],$reason);
        $committed=$wpdb->query('COMMIT');
        if($committed===false) wp_die('Transaction commit failed; inspect database and audit.');
        wp_safe_redirect(admin_url('admin.php?page=rc-publication-review&reviewed=1')); exit;
    }
}
