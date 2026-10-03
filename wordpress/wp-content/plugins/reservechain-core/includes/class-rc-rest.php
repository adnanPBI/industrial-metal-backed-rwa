<?php
if (!defined('ABSPATH')) { exit; }
class RC_REST {
    public static function init(){ add_action('rest_api_init',[__CLASS__,'routes']); }
    public static function routes(){
        register_rest_route('reservechain/v1','/config',['methods'=>'GET','callback'=>[__CLASS__,'config'],'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/assets',['methods'=>'GET','callback'=>fn()=>rest_ensure_response(['items'=>RC_Registry::all_public()]),'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/assets/(?P<slug>[a-z0-9-]+)',['methods'=>'GET','callback'=>[__CLASS__,'asset'],'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/passports/(?P<id>[A-Za-z0-9._-]+)',['methods'=>'GET','callback'=>[__CLASS__,'passport'],'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/waitlist',['methods'=>'POST','callback'=>[__CLASS__,'waitlist'],'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/waitlist/verify',['methods'=>'GET','callback'=>[__CLASS__,'verify'],'permission_callback'=>'__return_true']);
        register_rest_route('reservechain/v1','/health',['methods'=>'GET','callback'=>fn()=>rest_ensure_response(['ok'=>true,'mode'=>get_option('rc_mode','prelaunch'),'audit_chain_valid'=>RC_Audit::verify_chain()]),'permission_callback'=>'__return_true']);
    }
    public static function config(){ return rest_ensure_response(['mode'=>get_option('rc_mode','prelaunch'),'corporate_status'=>get_option('rc_corporate_status'),'mandatory_disclosure'=>get_option('rc_mandatory_disclosure'),'languages'=>get_option('rc_languages',['en','es','it'])]); }
    public static function asset($r){ $a=RC_Registry::by_slug($r['slug']); return $a?rest_ensure_response($a):new WP_Error('not_found','Asset not found.',['status'=>404]); }
    public static function passport($r){ $a=RC_Registry::by_passport($r['id']); if(!$a)return new WP_Error('not_found','Passport not found.',['status'=>404]); return rest_ensure_response(['passport_id'=>$a['passport_id'],'program_id'=>$a['program_id'],'name'=>$a['name'],'material'=>$a['material'],'material_form'=>$a['material_form'],'lot_id'=>$a['lot_id'],'purity'=>$a['purity'],'diameter'=>$a['diameter'],'verification_status'=>$a['verification_status'],'custody_status'=>$a['custody_status'],'reserve_status'=>$a['reserve_status'],'tokenization_status'=>$a['tokenization_status'],'disclaimer'=>'Illustrative/pre-launch record. No live reserve, custody, ownership or token claim is created by this endpoint.']); }
    public static function waitlist($r){ $d=$r->get_json_params(); if(!is_array($d))$d=[]; $result=RC_Waitlist::register($d); return is_wp_error($result)?$result:rest_ensure_response($result); }
    public static function verify($r){ $result=RC_Waitlist::verify($r->get_param('token')); return is_wp_error($result)?$result:rest_ensure_response($result); }
}
