<?php
/**
 * Plugin Name: Totem Manager
 * Description: Agency ERP with Glassmorphism UI, Project Management, and Finance tools.
 * Version: 1.0.0
 * Author: Totem Mass Media
 * Text Domain: totem-manager
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define Constants
define( 'TOTEM_VERSION', '1.0.0' );
define( 'TOTEM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TOTEM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Autoloader for classes
spl_autoload_register( function ( $class ) {
	$prefix   = 'Totem_Manager\\';
	$base_dir = TOTEM_PLUGIN_DIR . 'includes/';

	$len = strlen( $prefix );
	if ( strncmp( $prefix, $class, $len ) !== 0 ) {
		return;
	}

	$relative_class = substr( $class, $len );
	$file           = $base_dir . 'class-' . str_replace( '_', '-', strtolower( $relative_class ) ) . '.php';

	if ( file_exists( $file ) ) {
		require $file;
	}
} );

/**
 * Main Plugin Class
 */
class Totem_Manager {

	public function run() {
		// Activation Hook
		register_activation_hook( __FILE__, array( 'Totem_Manager\\Totem_Activator', 'activate' ) );

		// Initialize API
		add_action( 'rest_api_init', array( 'Totem_Manager\\Totem_Api', 'register_routes' ) );

		// Initialize Admin Menu
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );

		// Enqueue Scripts
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		// Initialize Cron
		add_action( 'totem_monthly_analysis', array( 'Totem_Manager\\Totem_Cron', 'run_analysis' ) );
	}

	public function add_admin_menu() {
		add_menu_page(
			'Totem Manager',
			'Totem Manager',
			'read', // Capability required (Base permission, refined in app)
			'totem-manager',
			array( $this, 'render_app' ),
			'dashicons-chart-area',
			6
		);
	}

	public function enqueue_scripts( $hook ) {
		if ( 'toplevel_page_totem-manager' !== $hook ) {
			return;
		}

		$script_asset = $this->get_asset_file( 'src/main.jsx' );
		$style_asset  = $this->get_asset_file( 'src/index.css' ); // Vite usually bundles css in JS or separate file

		if ( $script_asset ) {
			wp_enqueue_script(
				'totem-manager-app',
				TOTEM_PLUGIN_URL . 'dist/' . $script_asset['file'],
				array(),
				TOTEM_VERSION,
				true
			);

			// Security & Config Passing
			wp_localize_script( 'totem-manager-app', 'totemSettings', array(
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'user'  => array(
					'id'    => get_current_user_id(),
					'roles' => wp_get_current_user()->roles,
				)
			) );
		}

		// Enqueue CSS if it exists (Vite output logic varies)
		// We will look for CSS in manifest if available
		if ( isset( $script_asset['css'] ) && is_array( $script_asset['css'] ) ) {
			foreach ( $script_asset['css'] as $css_file ) {
				wp_enqueue_style(
					'totem-manager-style',
					TOTEM_PLUGIN_URL . 'dist/' . $css_file,
					array(),
					TOTEM_VERSION
				);
			}
		}
	}

	/**
	 * Parse Vite Manifest to get correct filename
	 */
	private function get_asset_file( $entry_name ) {
		$manifest_path = TOTEM_PLUGIN_DIR . 'dist/.vite/manifest.json';
		if ( ! file_exists( $manifest_path ) ) {
			// Try root dist manifest
			$manifest_path = TOTEM_PLUGIN_DIR . 'dist/manifest.json';
		}

		if ( file_exists( $manifest_path ) ) {
			$manifest = json_decode( file_get_contents( $manifest_path ), true );
			if ( isset( $manifest[ $entry_name ] ) ) {
				return $manifest[ $entry_name ];
			}
		}
		return false;
	}

	public function render_app() {
		echo '<div id="totem-manager-root"></div>';
	}
}

// Start the engine
$totem_manager = new Totem_Manager();
$totem_manager->run();
