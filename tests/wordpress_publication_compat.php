<?php
/**
 * Compatibility and fail-closed publication gates, without requiring a live WP database.
 * This does NOT substitute for WordPress/MariaDB integration tests.
 */
error_reporting(E_ALL);
define('ABSPATH', __DIR__ . '/../');
define('ARRAY_A', 'ARRAY_A');
class WP_Error {
    public $code;
    public function __construct($code, $message) { $this->code=$code; }
}
function is_wp_error($x){return $x instanceof WP_Error;}
function sanitize_textarea_field($s){return trim((string)$s);}
function sanitize_text_field($s){return trim((string)$s);}
function sanitize_key($s){return strtolower(preg_replace('/[^a-z0-9_\-]/','',(string)$s));}
function wp_json_encode($v){return json_encode($v);}
function get_current_user_id(){return 23;}
$hasReview=false;
function current_user_can($cap){global $hasReview;return $hasReview && $cap==='rc_review_assets';}
class RC_Audit{
    public static $events=[];
    public static function append(...$args){self::$events[]=$args;return 'mock_hash';}
}
class MockWPDB {
    public $prefix='wp_';
    public $row;
    public $fail=false;
    public function __construct(){
        $this->row=['id'=>1,'name'=>'Example','publication_state'=>'draft','purity'=>'Pending',
            'diameter'=>'Pending','verification_status'=>'Pending','custody_status'=>'Pending',
            'reserve_status'=>'Pending','tokenization_status'=>'Not issued','updated_at'=>'2026-01-01 00:00:00'];
    }
    public function prepare($query,...$args){return $query;}
    public function get_row($query,$output){return $this->row;}
    public function update($table,$fields,$where){
        if($this->fail)return false;
        $this->row=array_merge($this->row,$fields);
        return 1;
    }
}
$wpdb=new MockWPDB();
$root=__DIR__.'/../wordpress/wp-content/plugins/reservechain-core/includes/';
require_once $root.'class-rc-registry.php';
require_once $root.'class-rc-admin.php';
require_once $root.'class-rc-publication.php';
require_once $root.'class-rc-installer.php';
require_once $root.'class-rc-waitlist.php';
require_once $root.'class-rc-rest.php';
foreach([
 'RC_Registry'=>['table','all_public','update'],
 'RC_Admin'=>['init','save_asset','menu'],
 'RC_Publication'=>['init','submit_or_apply','review'],
 'RC_Installer'=>['activate','ensure_publication_schema'],
 'RC_Waitlist'=>['register','verify','all'],
 'RC_REST'=>['init','routes']
] as $type=>$methods) {
    foreach($methods as $method) if(!method_exists($type,$method))throw new Exception("$type::$method absent");
}
function rc_assert($cond,$message){if(!$cond){fwrite(STDERR,"FAIL: $message\n");exit(1);}}
$x=RC_Registry::update(1,['publication_state'=>'published'],'Try unauthorized publication');
rc_assert(is_wp_error($x),'direct publication must fail');
rc_assert($wpdb->row['publication_state']==='draft','no unapproved mutation');
$x=RC_Registry::update(1,['publication_state'=>'under_review'],'Send to review');
rc_assert(is_array($x) && $x['publication_state']==='under_review','nonpublic draft transition allowed');
$x=RC_Registry::update(1,['publication_state'=>'published'],'Reviewed, but checker missing',true);
rc_assert(is_wp_error($x),'reviewer capability required');
$hasReview=true;
$x=RC_Registry::update(1,['publication_state'=>'published'],'Authorized review reference',true);
rc_assert(is_array($x) && $x['publication_state']==='published','explicit approved call');
$hasReview=false;
$x=RC_Registry::update(1,['purity'=>'99%'],'Unreviewed material edit');
rc_assert(is_wp_error($x),'published edits must not bypass approval');
$wpdb->fail=true;
$x=RC_Registry::update(1,['publication_state'=>'unpublished'],'Withdraw');
rc_assert(is_wp_error($x),'failed SQL update must report failure');
$wpdb->fail=false;
$x=RC_Registry::update(1,['publication_state'=>'unpublished'],'Withdraw');
rc_assert(is_array($x) && $x['publication_state']==='unpublished','emergency unpublish permitted');
rc_assert(count(RC_Audit::$events)===3,'only successful updates audited in mock');
echo "WORDPRESS_COMPATIBILITY_AND_PUBLICATION_GATES=PASS\n";
