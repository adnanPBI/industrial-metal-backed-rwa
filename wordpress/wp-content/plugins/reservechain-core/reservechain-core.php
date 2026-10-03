<?php
/**
 * Plugin Name: ReserveChain Core
 * Description: Canonical pre-launch registry, waitlist, publication controls, audit trail and page architecture for ReserveChain.io.
 * Version: 0.2.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: ReserveChain Implementation Team
 */
if (!defined('ABSPATH')) { exit; }

define('RC_CORE_VERSION', '0.2.0');
define('RC_CORE_DIR', plugin_dir_path(__FILE__));
define('RC_CORE_URL', plugin_dir_url(__FILE__));

require_once RC_CORE_DIR . 'includes/class-rc-audit.php';
require_once RC_CORE_DIR . 'includes/class-rc-installer.php';
require_once RC_CORE_DIR . 'includes/class-rc-registry.php';
require_once RC_CORE_DIR . 'includes/class-rc-waitlist.php';
require_once RC_CORE_DIR . 'includes/class-rc-rest.php';
require_once RC_CORE_DIR . 'includes/class-rc-pages.php';
require_once RC_CORE_DIR . 'includes/class-rc-admin.php';

register_activation_hook(__FILE__, ['RC_Installer', 'activate']);
add_action('plugins_loaded', function () {
    RC_Pages::init();
    RC_REST::init();
    RC_Admin::init();
});
