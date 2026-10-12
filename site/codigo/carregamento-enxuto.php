/**
 * BMH · carregamento enxuto nas páginas nativas (07/10/2026).
 * Nas páginas que NÃO são do Elementor (a home nova e as próximas), não carrega os arquivos do Elementor e dos
 * complementos dele (ElementsKit, Essential Addons, Gum, Stratum, Envato, MetForm). As páginas antigas do Elementor
 * continuam carregando tudo, como antes. Na página inicial, tira também o CSS de blocos que ela não usa.
 * Guardado no plugin Code Snippets (só no site, parte da frente). Cópia em site/codigo/carregamento-enxuto.php.
 */
function bmh_carregamento_enxuto() {
	if ( is_admin() || wp_doing_ajax() || is_customize_preview() ) {
		return;
	}
	if ( isset( $_GET['elementor-preview'] ) ) {
		return;
	}
	$id = get_queried_object_id();
	if ( ! $id || ! is_singular() ) {
		return;
	}
	if ( 'builder' === get_post_meta( $id, '_elementor_edit_mode', true ) ) {
		return;
	}
	$marcas = array(
		'/plugins/elementor/',
		'/plugins/elementor-pro/',
		'/plugins/elementskit-lite/',
		'/plugins/essential-addons-for-elementor-lite/',
		'/plugins/gum-elementor-addon/',
		'/plugins/stratum/',
		'/plugins/envato-elements/',
		'/plugins/metform/',
		'/uploads/elementor/',
	);
	foreach ( array( wp_scripts(), wp_styles() ) as $fila ) {
		$eh_script = ( $fila instanceof WP_Scripts );
		foreach ( (array) $fila->queue as $nome ) {
			if ( empty( $fila->registered[ $nome ] ) ) {
				continue;
			}
			$src = (string) $fila->registered[ $nome ]->src;
			foreach ( $marcas as $marca ) {
				if ( '' !== $src && false !== strpos( $src, $marca ) ) {
					if ( $eh_script ) {
						wp_dequeue_script( $nome );
					} else {
						wp_dequeue_style( $nome );
					}
					break;
				}
			}
		}
	}
	if ( is_front_page() ) {
		foreach ( array( 'wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles' ) as $nome ) {
			wp_dequeue_style( $nome );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'bmh_carregamento_enxuto', 9999 );
add_action( 'wp_print_styles', 'bmh_carregamento_enxuto', 9999 );
add_action( 'wp_print_scripts', 'bmh_carregamento_enxuto', 9999 );
add_action( 'wp_print_footer_scripts', 'bmh_carregamento_enxuto', 1 );
