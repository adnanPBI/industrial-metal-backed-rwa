<?php
if (!defined('ABSPATH')) { exit; }
add_action('after_setup_theme', function(){ add_theme_support('title-tag'); add_theme_support('post-thumbnails'); add_theme_support('html5',['search-form','comment-form','gallery','caption','style','script']); register_nav_menus(['primary'=>'Primary Navigation','footer'=>'Footer Navigation']); });
add_action('wp_enqueue_scripts', function(){ wp_enqueue_style('reservechain',get_template_directory_uri().'/assets/css/theme.css',[], '0.2.0'); wp_enqueue_script('reservechain',get_template_directory_uri().'/assets/js/theme.js',[], '0.2.0',true); wp_localize_script('reservechain','RC_THEME',['api'=>esc_url_raw(rest_url('reservechain/v1'))]); });
add_filter('wp_robots', function($robots){ if(is_page()&&get_post_meta(get_queried_object_id(),'rc_noindex',true)){$robots['noindex']=true;$robots['nofollow']=true;}return $robots;});
function rc_theme_pages(){ return class_exists('RC_Pages') ? RC_Pages::definitions() : []; }
function rc_theme_by_key($key){foreach(rc_theme_pages() as $p)if($p['key']===$key)return $p;return null;}
function rc_theme_url($key){$p=rc_theme_by_key($key);if(!$p)return home_url('/');$page=get_page_by_path($p['slug']);return $page?get_permalink($page):home_url('/'.$p['slug'].'/');}
