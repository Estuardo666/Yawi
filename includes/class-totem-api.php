<?php
namespace Totem_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Totem_Api {

	public static function register_routes() {
		$controller = new self();

		// Projects
		register_rest_route( 'totem/v1', '/projects', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( $controller, 'get_projects' ),
				'permission_callback' => array( $controller, 'permissions_check' ),
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'create_project' ),
				'permission_callback' => array( $controller, 'permissions_check_write' ),
			),
		) );

		register_rest_route( 'totem/v1', '/projects/(?P<id>\d+)', array(
			array(
				'methods'             => 'PUT',
				'callback'            => array( $controller, 'update_project' ),
				'permission_callback' => array( $controller, 'permissions_check_write' ),
			),
		) );

		// Finance
		register_rest_route( 'totem/v1', '/finance/stats', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( $controller, 'get_finance_stats' ),
				'permission_callback' => array( $controller, 'permissions_check_manager' ),
			),
		) );

		// Pocket
		register_rest_route( 'totem/v1', '/pocket/submit', array(
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'submit_pocket_expense' ),
				'permission_callback' => array( $controller, 'permissions_check' ),
			),
		) );

		// Settings
		register_rest_route( 'totem/v1', '/settings', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( $controller, 'get_settings' ),
				'permission_callback' => array( $controller, 'permissions_check' ),
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'save_settings' ),
				'permission_callback' => array( $controller, 'permissions_check_manager' ),
			),
		) );
	}

	public function permissions_check( $request ) {
		return current_user_can( 'read' );
	}

	public function permissions_check_write( $request ) {
		return current_user_can( 'edit_posts' ) || current_user_can('manage_totem_projects');
	}

	public function permissions_check_manager( $request ) {
		return current_user_can( 'manage_options' ) || current_user_can('manage_totem_finance');
	}

	// --- Projects ---

	public function get_projects( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'totem_projects';

		try {
			$results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC" );
			return rest_ensure_response( $results );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'db_error', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public function create_project( $request ) {
		global $wpdb;
		$params = $request->get_json_params();
		$name = sanitize_text_field( $params['name'] ?? '' );
		$client_id = intval( $params['client_id'] ?? 0 );

		if ( empty( $name ) ) {
			return new \WP_Error( 'invalid_param', 'Project name required', array( 'status' => 400 ) );
		}

		$wpdb->insert(
			$wpdb->prefix . 'totem_projects',
			array(
				'name' => $name,
				'client_id' => $client_id,
				'status' => 'backlog'
			),
			array( '%s', '%d', '%s' )
		);

		return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Project created' ) );
	}

	public function update_project( $request ) {
		global $wpdb;
		$id = $request['id'];
		$params = $request->get_json_params();
		$status = sanitize_text_field( $params['status'] ?? '' );

		if ( empty( $status ) ) {
			return new \WP_Error( 'invalid_param', 'Status required', array( 'status' => 400 ) );
		}

		$updated = $wpdb->update(
			$wpdb->prefix . 'totem_projects',
			array( 'status' => $status ),
			array( 'id' => $id ),
			array( '%s' ),
			array( '%d' )
		);

		if ( $updated === false ) {
			return new \WP_Error( 'db_error', 'Could not update project', array( 'status' => 500 ) );
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	// --- Finance ---

	public function get_finance_stats( $request ) {
		global $wpdb;
		$finance_table = $wpdb->prefix . 'totem_finance';

		// Calculate Income
		$income = $wpdb->get_var( "SELECT SUM(amount) FROM $finance_table WHERE type = 'income'" ) ?: 0;
		// Calculate Expenses
		$expenses = $wpdb->get_var( "SELECT SUM(amount) FROM $finance_table WHERE type = 'expense'" ) ?: 0;

		// Add Pocket expenses that are NOT billable (billable ones are passed to client, so maybe treated differently?
		// Logic: Profitability = Income - (Direct Expenses + Allocated Pocket Expenses).
		// If pocket expense is billable, it might be income later, but for now it's an expense until billed.
		// Let's assume pocket expenses are expenses for the agency unless reimbursed.

		// Get stored tips
		$tips = get_option( 'totem_smart_tips', array() );

		return rest_ensure_response( array(
			'income' => (float)$income,
			'expenses' => (float)$expenses,
			'tips' => $tips
		) );
	}

	// --- Pocket ---

	public function submit_pocket_expense( $request ) {
		global $wpdb;
		$params = $request->get_json_params();

		$amount = floatval( $params['amount'] ?? 0 );
		$category = sanitize_text_field( $params['category'] ?? 'misc' );
		$billable = !empty( $params['billable'] );
		$user_id = get_current_user_id();

		if ( $amount <= 0 ) {
			return new \WP_Error( 'invalid_param', 'Amount must be positive', array( 'status' => 400 ) );
		}

		$wpdb->insert(
			$wpdb->prefix . 'totem_pocket',
			array(
				'user_id' => $user_id,
				'amount' => $amount,
				'category' => $category,
				'is_billable' => $billable ? 1 : 0,
				'status' => 'pending'
			),
			array( '%d', '%f', '%s', '%d', '%s' )
		);

		return rest_ensure_response( array( 'success' => true, 'id' => $wpdb->insert_id ) );
	}

	// --- Settings ---

	public function get_settings( $request ) {
		global $wpdb;
		$results = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->prefix}totem_options" );

		$settings = array(
			'logo_url' => '',
			'primary_color' => '#6366f1',
			'secondary_color' => '#ec4899',
			'font_family' => 'Inter'
		);

		foreach ( $results as $row ) {
			$settings[$row->option_name] = $row->option_value;
		}

		return rest_ensure_response( $settings );
	}

	public function save_settings( $request ) {
		global $wpdb;
		$params = $request->get_json_params();
		$allowed_keys = array( 'logo_url', 'primary_color', 'secondary_color', 'font_family' );

		foreach ( $allowed_keys as $key ) {
			if ( isset( $params[$key] ) ) {
				$value = sanitize_text_field( $params[$key] );
				// Upsert logic
				$existing = $wpdb->get_var( $wpdb->prepare( "SELECT option_name FROM {$wpdb->prefix}totem_options WHERE option_name = %s", $key ) );

				if ( $existing ) {
					$wpdb->update(
						$wpdb->prefix . 'totem_options',
						array( 'option_value' => $value ),
						array( 'option_name' => $key )
					);
				} else {
					$wpdb->insert(
						$wpdb->prefix . 'totem_options',
						array( 'option_name' => $key, 'option_value' => $value )
					);
				}
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}
