<?php
/**
 * Render the actual ReserveChain WordPress shortcodes without a live database.
 * This tests the production HTML templates and canonical deployment metadata;
 * it is not a substitute for a separately deployed WordPress staging QA.
 */
error_reporting(E_ALL);
define('ABSPATH', dirname(__DIR__).'/');
define('RC_CORE_DIR', dirname(__DIR__).'/wordpress/wp-content/plugins/reservechain-core/');
function sanitize_key($s){return strtolower(preg_replace('/[^a-z0-9_-]/','',(string)$s));}
function shortcode_atts($defaults,$atts){return array_merge($defaults,$atts);}
function esc_html($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function esc_attr($v){return esc_html($v);}
function esc_url($v){return esc_html($v);}
function get_template_directory(){return dirname(__DIR__).'/wordpress/wp-content/themes/reservechain';}
function get_page_by_path($p){return null;}
function home_url($p='/'){return 'https://example.invalid'.(str_starts_with($p,'/')?$p:'/'.$p);}
function get_option($k,$default=''){return $k==='rc_mandatory_disclosure'?'PRE-LAUNCH: no offer or sale':$default;}
class RC_Registry {
  public static function by_slug($slug){
    if(!in_array($slug,['copper-powder','nickel-wire'],true))return null;
    $cu=$slug==='copper-powder';
    return [
      'program_id'=>$cu?'RC-PROG-CU-001':'RC-PROG-NI-001',
      'name'=>$cu?'Ultrafine Copper Powder':'Ultrafine Nickel Wire 0.025 mm',
      'purity'=>$cu?'99.9999%':'99.9807%',
      'diameter'=>$cu?'':'0.025 mm',
      'lot_id'=>$cu?'#03-K-07':'120/NP1',
      'laboratory'=>'IGAS research',
      'certificate_no'=>$cu?'0004512':'0004368',
      'certificate_date'=>$cu?'04.07.2022':'19.10.2021',
      'custody_status'=>'Pending owner-approved documentation',
      'reserve_status'=>'No live reserve claim published',
      'tokenization_status'=>'Not issued',
      'verification_status'=>'SOURCE EVIDENCE / PRE-LAUNCH',
      'evidence_note'=>'Historical assay; not proof of ownership, custody or current reserves.',
      'passport_id'=>$cu?'RC-DAP-CU-03K07-DEMO':'RC-DAP-NI-120NP1-DEMO'
    ];
  }
  public static function all_public(){return [self::by_slug('copper-powder'),self::by_slug('nickel-wire')];}
}
require_once RC_CORE_DIR.'includes/class-rc-pages.php';
$manifest=json_decode(file_get_contents(get_template_directory().'/assets/data/sepolia-demo.json'),true,512,JSON_THROW_ON_ERROR);
if($manifest['chainId']!==11155111 || count($manifest['assets'])!==2)throw new RuntimeException('Wrong chain or program count');
$addresses=[];
foreach($manifest['assets'] as $token){
  $addresses[$token['programId']]=$token['address'];
  if($token['totalSupply']!=='0')throw new RuntimeException('Deployment manifest supply mismatch');
}
$copper=RC_Pages::shortcode(['key'=>'copper-powder']);
$nickel=RC_Pages::shortcode(['key'=>'nickel-wire']);
$passports=RC_Pages::shortcode(['key'=>'digital-asset-passports']);
function assert_contains_contract($html,$address,$label){
  $expected='href="https://sepolia.etherscan.io/address/'.$address.'"';
  if(!str_contains($html,$expected))throw new RuntimeException('Sepolia contract URL missing on '.$label);
}
assert_contains_contract($copper,$addresses['RC-PROG-CU-001'],'Copper Powder page');
assert_contains_contract($nickel,$addresses['RC-PROG-NI-001'],'Nickel Wire page');
if(str_contains($copper,$addresses['RC-PROG-NI-001']) || str_contains($nickel,$addresses['RC-PROG-CU-001']))throw new RuntimeException('Cross-program contract leakage');
foreach($addresses as $addr)assert_contains_contract($passports,$addr,'Digital Asset Passport overview');
foreach([$copper,$nickel,$passports] as $page){
  if(!str_contains($page,'https://sepolia.etherscan.io/address/'))throw new RuntimeException('No actual explorer link');
}
echo "WORDPRESS_SEPOLIA_RENDER=PASS routes=3 contracts=2 chain=11155111\n";
