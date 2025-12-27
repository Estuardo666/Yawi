<?php
namespace Totem_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Totem_Cron {

	public static function run_analysis() {
		global $wpdb;

		// 1. Analyze Margin
		$finance_table = $wpdb->prefix . 'totem_finance';
		$income = $wpdb->get_var( "SELECT SUM(amount) FROM $finance_table WHERE type = 'income'" ) ?: 0;
		$expenses = $wpdb->get_var( "SELECT SUM(amount) FROM $finance_table WHERE type = 'expense'" ) ?: 0;

		$tips = array();

		// Calculate Margin %
		if ( $income > 0 ) {
			$margin = (($income - $expenses) / $income) * 100;
			if ( $margin < 10 ) {
				$tips[] = "Warning: Global profit margin is below 10% ({$margin}%). Review expenses.";
			}
		}

		// 2. Client Analysis (Placeholder Logic)
		// In a real scenario, we'd group by client_id via projects table
		// "Client X has high revenue but low margin (<10%). Renegotiate fees."

		// 3. Cash Flow
		// "Cash flow alert: Upcoming expenses exceed confirmed income."
		// Simulating a check
		if ( $expenses > $income ) {
			$tips[] = "Cash flow alert: Expenses currently exceed income.";
		}

		// Save to options
		update_option( 'totem_smart_tips', $tips );
	}
}
