<?php
if (!defined('ABSPATH')) { exit; }
class RC_Waitlist {
    public static function table(){ global $wpdb; return $wpdb->prefix.'rc_waitlist'; }
    public static function rate_key(){ $ip=$_SERVER['REMOTE_ADDR']??'unknown'; return 'rc_wl_'.hash('sha256',wp_salt('nonce').'|'.$ip); }
    public static function register($data){
        global $wpdb; $key=self::rate_key(); $count=(int)get_transient($key); if($count>=8) return new WP_Error('rate_limited','Too many attempts. Please try again later.',['status'=>429]); set_transient($key,$count+1,10*MINUTE_IN_SECONDS);
        $first=sanitize_text_field($data['first_name']??''); $last=sanitize_text_field($data['last_name']??''); $email=sanitize_email($data['email']??''); $country=sanitize_text_field($data['country']??'');
        if(!$first||!$last||!is_email($email)||!$country)return new WP_Error('invalid_fields','Required fields are missing or invalid.',['status'=>422]);
        foreach(['consent_updates','privacy_ack','no_offer_ack'] as $k) if(empty($data[$k])) return new WP_Error('consent_required','Required acknowledgements must be accepted.',['status'=>422]);
        if(!empty($data['website'])) return ['ok'=>true,'status'=>'received']; // honeypot
        $email_hash=hash('sha256',strtolower($email)); $table=self::table(); $existing=$wpdb->get_row($wpdb->prepare("SELECT public_id, verified_at FROM {$table} WHERE email_hash=%s",$email_hash),ARRAY_A); if($existing)return ['ok'=>true,'status'=>$existing['verified_at']?'verified':'verification_pending'];
        $public=wp_generate_uuid4(); $token=bin2hex(random_bytes(32)); $token_hash=hash('sha256',$token); $now=gmdate('Y-m-d H:i:s');
        $row=['public_id'=>$public,'first_name'=>$first,'last_name'=>$last,'email'=>$email,'email_hash'=>$email_hash,'country'=>$country,'participant_type'=>sanitize_text_field($data['participant_type']??''),'material_interest'=>sanitize_text_field($data['material_interest']??''),'approximate_interest_range'=>sanitize_text_field($data['approximate_interest_range']??''),'intended_participation_type'=>sanitize_text_field($data['intended_participation_type']??''),'message'=>sanitize_textarea_field($data['message']??''),'consent_updates'=>1,'privacy_ack'=>1,'no_offer_ack'=>1,'verification_token_hash'=>$token_hash,'subscription_status'=>'pending_verification','source'=>'website','created_at'=>$now];
        $wpdb->insert($table,$row); $id=$wpdb->insert_id; RC_Audit::append('waitlist_registered','waitlist',$public,null,['country'=>$country,'participant_type'=>$row['participant_type'],'material_interest'=>$row['material_interest'],'status'=>'pending_verification'],'Registration of interest received',0);
        $url=add_query_arg(['token'=>$token],rest_url('reservechain/v1/waitlist/verify')); $subject='Verify your ReserveChain waitlist registration'; $body="Hello {$first},\n\nVerify your email address:\n{$url}\n\nRegistration is a non-binding expression of interest and is not an investment, token purchase or asset reservation."; wp_mail($email,$subject,$body);
        return ['ok'=>true,'status'=>'verification_pending','public_id'=>$public];
    }
    public static function verify($token){
        global $wpdb; $hash=hash('sha256',(string)$token); $table=self::table(); $row=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE verification_token_hash=%s",$hash),ARRAY_A); if(!$row)return new WP_Error('invalid_token','Invalid or expired token.',['status'=>400]);
        if(!$row['verified_at'] && !empty($row['created_at']) && strtotime($row['created_at'].' UTC') < time() - 48*HOUR_IN_SECONDS) return new WP_Error('expired_token','Verification token expired. Please register again or contact support.',['status'=>400]);
        if(!$row['verified_at']){$now=gmdate('Y-m-d H:i:s');$wpdb->update($table,['verified_at'=>$now,'subscription_status'=>'verified','verification_token_hash'=>null],['id'=>$row['id']]);RC_Audit::append('waitlist_email_verified','waitlist',$row['public_id'],['status'=>$row['subscription_status']],['status'=>'verified'],'Email verification completed',0);} return ['ok'=>true,'status'=>'verified'];
    }
    public static function all(){ global $wpdb; return $wpdb->get_results("SELECT id, public_id, first_name, last_name, email, country, participant_type, material_interest, verified_at, subscription_status, source, created_at FROM ".self::table()." ORDER BY id DESC",ARRAY_A); }
}
