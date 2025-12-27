<?php
namespace Totem_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Totem_Activator {

	public static function activate() {
		self::create_tables();
		self::add_roles();
		self::schedule_cron();
	}

	private static function create_tables() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		// 1. Clients
		$sql_clients = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_clients (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			name tinytext NOT NULL,
			logo_url varchar(255) DEFAULT '' NOT NULL,
			brand_colors longtext DEFAULT NULL,
			contact_email varchar(100) DEFAULT '' NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";
		dbDelta( $sql_clients );

		// 2. Projects
		$sql_projects = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_projects (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			client_id mediumint(9) NOT NULL,
			name text NOT NULL,
			status varchar(50) DEFAULT 'backlog' NOT NULL,
			deadline datetime DEFAULT NULL,
			budget decimal(10,2) DEFAULT 0.00,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id),
			KEY client_id (client_id)
		) $charset_collate;";
		dbDelta( $sql_projects );

		// 3. Finance
		$sql_finance = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_finance (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			project_id mediumint(9) DEFAULT NULL,
			type varchar(20) NOT NULL, -- income, expense
			category varchar(50) NOT NULL,
			amount decimal(10,2) NOT NULL,
			date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			status varchar(20) DEFAULT 'pending' NOT NULL,
			PRIMARY KEY  (id),
			KEY project_id (project_id)
		) $charset_collate;";
		dbDelta( $sql_finance );

		// 4. Pocket (Quick Expenses)
		$sql_pocket = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_pocket (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			project_id mediumint(9) DEFAULT NULL,
			amount decimal(10,2) NOT NULL,
			receipt_img varchar(255) DEFAULT NULL,
			is_billable boolean DEFAULT 0 NOT NULL,
			category varchar(50) DEFAULT 'misc',
			status varchar(20) DEFAULT 'pending' NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";
		dbDelta( $sql_pocket );

		// 5. Shoots
		$sql_shoots = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_shoots (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			project_id mediumint(9) NOT NULL,
			start_time datetime NOT NULL,
			end_time datetime NOT NULL,
			location text NOT NULL,
			google_event_id varchar(255) DEFAULT NULL,
			maps_link text DEFAULT NULL,
			PRIMARY KEY  (id)
		) $charset_collate;";
		dbDelta( $sql_shoots );

		// 6. Options (For White Label settings mostly)
		$sql_options = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}totem_options (
			option_name varchar(191) NOT NULL,
			option_value longtext NOT NULL,
			PRIMARY KEY  (option_name)
		) $charset_collate;";
		dbDelta( $sql_options );
	}

	private static function add_roles() {
		// Manager: Create projects/events.
		add_role( 'totem_manager', 'Totem Manager', array(
			'read' => true,
			'upload_files' => true,
			'manage_totem_projects' => true,
			'manage_totem_finance' => true,
			'view_totem_reports' => true,
		) );

		// Creator: View tasks only.
		add_role( 'totem_creator', 'Totem Creator', array(
			'read' => true,
			'view_totem_tasks' => true,
		) );

		// Client: Read-only access to their specific project portal.
		add_role( 'totem_client', 'Totem Client', array(
			'read' => true,
			'view_own_totem_project' => true,
		) );
	}

	private static function schedule_cron() {
		if ( ! wp_next_scheduled( 'totem_monthly_analysis' ) ) {
			wp_schedule_event( time(), 'monthly', 'totem_monthly_analysis' );
		}
	}
}
