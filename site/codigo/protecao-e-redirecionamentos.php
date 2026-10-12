/**
 * BMH · proteção e redirecionamentos (no ar desde 08/10/2026; páginas antigas incluídas no mesmo dia).
 * 1. /home/ (endereço da home antiga, hoje "página não encontrada") passa a levar para a página inicial (301).
 * 2. Páginas antigas do Elementor (tratamento, contato, institucional, médicos, Dr. Alberto, Dr. Hélio) levam à página nova
 *    equivalente (301).
 * 3. Página de autor (/author/... e ?author=1) passa a levar para a página inicial: ela mostrava o login do painel.
 * 4. A lista de usuários da API (/wp-json/wp/v2/users) só responde para quem está logado com permissão de ver
 *    usuários. Os scripts do Claude entram com a senha de aplicativo do administrador e continuam funcionando.
 * Guardado no plugin Code Snippets (só no site). Cópia em site/codigo/protecao-e-redirecionamentos.php.
 * Para desfazer: desligar este código no painel, um clique.
 */
function bmh_redirecionamentos() {
	$caminho = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
	if ( 'home' === $caminho || is_author() || isset( $_GET['author'] ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
	// Páginas antigas do Elementor substituídas em 08/10/2026 (viraram rascunho; cópia em
	// saidas/site-novo/copia-site-antigo-2026-10-06/). Destino escolhido pelas buscas de cada uma no Search Console.
	$antigas = array(
		'tratamento'    => '/',
		'contato'       => '/',
		'institucional' => '/',
		'medicos'       => '/',
		'alberto-jorge' => '/hiperbarica-taguatinga/',
		'helio-ivan'    => '/hiperbarica-asa-sul/',
	);
	if ( isset( $antigas[ $caminho ] ) ) {
		wp_safe_redirect( home_url( $antigas[ $caminho ] ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'bmh_redirecionamentos', 1 );

function bmh_esconde_usuarios( $resultado, $servidor, $pedido ) {
	if ( 0 === strpos( $pedido->get_route(), '/wp/v2/users' ) && ! current_user_can( 'list_users' ) ) {
		return new WP_Error( 'rest_forbidden', 'Não disponível.', array( 'status' => 401 ) );
	}
	return $resultado;
}
add_filter( 'rest_pre_dispatch', 'bmh_esconde_usuarios', 10, 3 );
