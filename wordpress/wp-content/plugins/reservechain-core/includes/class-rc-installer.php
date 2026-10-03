<?php
if (!defined('ABSPATH')) { exit; }
class RC_Installer {
    public static function activate() {
        global $wpdb; require_once ABSPATH . 'wp-admin/includes/upgrade.php'; $charset = $wpdb->get_charset_collate();
        $assets = $wpdb->prefix . 'rc_assets'; $docs = $wpdb->prefix . 'rc_documents'; $wait = $wpdb->prefix . 'rc_waitlist'; $audit = $wpdb->prefix . 'rc_audit';
        dbDelta("CREATE TABLE {$assets} (
            id bigint unsigned NOT NULL AUTO_INCREMENT, program_id varchar(64) NOT NULL, slug varchar(120) NOT NULL, name varchar(200) NOT NULL,
            material varchar(100) NOT NULL, material_form varchar(100) NOT NULL, lot_id varchar(120) NULL, purity varchar(60) NULL, diameter varchar(60) NULL,
            certificate_no varchar(120) NULL, certificate_date date NULL, laboratory varchar(180) NULL,
            publication_state varchar(32) NOT NULL DEFAULT 'draft', verification_status varchar(120) NOT NULL DEFAULT 'Pending',
            custody_status varchar(180) NOT NULL DEFAULT 'Pending owner-approved documentation', reserve_status varchar(180) NOT NULL DEFAULT 'Not published',
            tokenization_status varchar(120) NOT NULL DEFAULT 'Not issued', passport_id varchar(120) NULL, evidence_note text NULL,
            created_at datetime NOT NULL, updated_at datetime NOT NULL, PRIMARY KEY (id), UNIQUE KEY program_id (program_id), UNIQUE KEY slug (slug)
        ) {$charset};");
        dbDelta("CREATE TABLE {$docs} (
            id bigint unsigned NOT NULL AUTO_INCREMENT, asset_id bigint unsigned NULL, document_type varchar(80) NOT NULL, title varchar(220) NOT NULL,
            version varchar(40) NULL, source_reference varchar(220) NULL, file_url text NULL, sha256 char(64) NULL, visibility varchar(24) NOT NULL DEFAULT 'private',
            publication_state varchar(32) NOT NULL DEFAULT 'under_review', issued_at date NULL, approved_at datetime NULL, created_at datetime NOT NULL,
            PRIMARY KEY (id), KEY asset_id (asset_id), KEY publication_state (publication_state)
        ) {$charset};");
        dbDelta("CREATE TABLE {$wait} (
            id bigint unsigned NOT NULL AUTO_INCREMENT, public_id char(36) NOT NULL, first_name varchar(100) NOT NULL, last_name varchar(100) NOT NULL,
            email varchar(320) NOT NULL, email_hash char(64) NOT NULL, country varchar(100) NOT NULL, participant_type varchar(100) NULL,
            material_interest varchar(100) NULL, approximate_interest_range varchar(100) NULL, intended_participation_type varchar(120) NULL, message text NULL,
            consent_updates tinyint(1) NOT NULL DEFAULT 0, privacy_ack tinyint(1) NOT NULL DEFAULT 0, no_offer_ack tinyint(1) NOT NULL DEFAULT 0,
            verification_token_hash char(64) NULL, verified_at datetime NULL, subscription_status varchar(30) NOT NULL DEFAULT 'pending_verification',
            source varchar(120) NULL, created_at datetime NOT NULL, PRIMARY KEY (id), UNIQUE KEY public_id (public_id), UNIQUE KEY email_hash (email_hash)
        ) {$charset};");
        dbDelta("CREATE TABLE {$audit} (
            id bigint unsigned NOT NULL AUTO_INCREMENT, actor_user_id bigint unsigned NOT NULL DEFAULT 0, action varchar(120) NOT NULL,
            record_type varchar(80) NOT NULL, record_id varchar(120) NOT NULL, before_json longtext NULL, after_json longtext NULL, reason text NULL,
            prev_hash char(64) NOT NULL, event_hash char(64) NOT NULL, created_at datetime NOT NULL, PRIMARY KEY (id), KEY record_ref (record_type,record_id), UNIQUE KEY event_hash (event_hash)
        ) {$charset};");
        self::seed_options(); self::seed_assets(); self::roles(); RC_Pages::seed_pages(); flush_rewrite_rules();
        RC_Audit::append('plugin_activated','system','reservechain-core',null,['version'=>RC_CORE_VERSION],'Initial platform installation',0);
    }
    private static function seed_options() {
        add_option('rc_mode','prelaunch');
        add_option('rc_corporate_status','Swiss corporate and issuance structure in development.');
        add_option('rc_mandatory_disclosure','ReserveChain is currently in development. No tokens are being offered or sold through this website. Registration of interest does not constitute an investment, token purchase, asset reservation, price reservation, token allocation or entitlement to participate in any future offering. Any future availability will be subject to the final Swiss corporate and legal structure, definitive offering documentation, asset verification, custody arrangements, jurisdictional eligibility, KYC/KYB, sanctions screening and final approval.');
        add_option('rc_languages',['en','es','it']);
    }
    private static function seed_assets() {
        global $wpdb; $table=$wpdb->prefix.'rc_assets'; $now=gmdate('Y-m-d H:i:s');
        $items=[
            ['RC-PROG-CU-001','copper-powder','Ultrafine Copper Powder','Copper','Ultrafine powder','#03-K-07','99.9999%',null,'0004512','2022-07-04','IGAS research','published','Source supplied / publication review','Pending owner-approved documentation','No live reserve claim published','Not issued','RC-DAP-CU-03K07-DEMO','Supplied IGAS Certificate of Analysis supports displayed purity and lot reference. It does not by itself establish current ownership, custody, insurance or reserves.'],
            ['RC-PROG-NI-001','nickel-wire','Ultrafine Nickel Wire 0.025 mm','Nickel','Wire','120/NP1','99.9807%','0.025 mm','0004368','2021-10-19','IGAS research','published','Source supplied / publication review','Pending owner-approved documentation','No live reserve claim published','Not issued','RC-DAP-NI-120NP1-DEMO','Supplied IGAS Certificate of Analysis supports displayed purity and wire diameter. It does not by itself establish current ownership, custody, insurance or reserves.'],
        ];
        foreach($items as $x){ if($wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE program_id=%s",$x[0]))) continue;
            $wpdb->insert($table,['program_id'=>$x[0],'slug'=>$x[1],'name'=>$x[2],'material'=>$x[3],'material_form'=>$x[4],'lot_id'=>$x[5],'purity'=>$x[6],'diameter'=>$x[7],'certificate_no'=>$x[8],'certificate_date'=>$x[9],'laboratory'=>$x[10],'publication_state'=>$x[11],'verification_status'=>$x[12],'custody_status'=>$x[13],'reserve_status'=>$x[14],'tokenization_status'=>$x[15],'passport_id'=>$x[16],'evidence_note'=>$x[17],'created_at'=>$now,'updated_at'=>$now]); }
    }
    private static function roles() {
        $caps=['read'=>true,'rc_edit_assets'=>true,'rc_review_assets'=>true,'rc_manage_waitlist'=>true,'rc_view_audit'=>true];
        add_role('rc_editor','ReserveChain Editor',['read'=>true,'rc_edit_assets'=>true]);
        add_role('rc_reviewer','ReserveChain Reviewer',['read'=>true,'rc_review_assets'=>true,'rc_view_audit'=>true]);
        add_role('rc_compliance','ReserveChain Compliance',['read'=>true,'rc_review_assets'=>true,'rc_manage_waitlist'=>true,'rc_view_audit'=>true]);
        if($admin=get_role('administrator')) foreach(array_keys($caps) as $cap) $admin->add_cap($cap);
    }
}
