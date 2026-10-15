/**
 * BMH · proteção e redirecionamentos (no ar desde 08/10/2026; páginas antigas incluídas no mesmo dia).
 * 1. /home/ (endereço da home antiga, hoje "página não encontrada") passa a levar para a página inicial (301).
 * 2. Páginas antigas do Elementor (tratamento, contato, institucional, médicos, Dr. Alberto, Dr. Hélio) levam à página nova
 *    equivalente (301).
 * 3. Página de autor (/author/... e ?author=1) passa a levar para a página inicial: ela mostrava o login do painel.
 * 4. A lista de usuários da API (/wp-json/wp/v2/users) só responde para quem está logado com permissão de ver
 *    usuários. Os scripts do Claude entram com a senha de aplicativo do administrador e continuam funcionando.
 * Guardado no plugin Code Snippets (só no site). Cópia em site/codigo/protecao-e-redirecionamentos.php.
 * 5. (15/10/2026) Os redirecionamentos levam junto o que vem depois do "?" (gclid do anúncio, UTMs): antes, quem
 *    chegava por /tratamento/?gclid=... caía na home sem o código e o Google perdia o contato. E a /lp/ (Elementor,
 *    antiga página do anúncio) passa a levar à página inicial (pedido do Jorge, 15/10/2026).
 * Para desfazer: desligar este código no painel, um clique.
 */
function bmh_redirecionamentos() {
	$caminho = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
	// o que vem depois do "?" segue junto (gclid, utm_*), menos no redirecionamento de autor (não pode voltar o ?author)
	$resto = (string) ( $_SERVER['QUERY_STRING'] ?? '' );
	$com_resto = function ( $destino ) use ( $resto ) {
		// redirecionamento nunca vai para o cache do LiteSpeed: o cache ignora gclid e utm_* na chave e devolvia a
		// cópia guardada com o código de outra pessoa (achado em 15/10/2026)
		do_action( 'litespeed_control_set_nocache', 'redirecionamento BMH com gclid/utm' );
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
		return home_url( $destino ) . ( '' !== $resto ? '?' . $resto : '' );
	};
	if ( is_author() || isset( $_GET['author'] ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
	if ( 'home' === $caminho ) {
		wp_safe_redirect( $com_resto( '/' ), 301 );
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
		'lp'            => '/',
	);
	if ( isset( $antigas[ $caminho ] ) ) {
		wp_safe_redirect( $com_resto( $antigas[ $caminho ] ), 301 );
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

// Limpa o cache do LiteSpeed de endereços escolhidos (15/10/2026). Só administrador (senha de aplicativo do Claude).
// POST /wp-json/bmh/v1/limpar-cache {"urls": ["/tratamento/", ...]} ou {"tudo": true}
add_action( 'rest_api_init', function () {
	register_rest_route( 'bmh/v1', '/limpar-cache', array(
		'methods'             => 'POST',
		'permission_callback' => function () { return current_user_can( 'manage_options' ); },
		'callback'            => function ( $pedido ) {
			if ( $pedido->get_param( 'tudo' ) ) {
				do_action( 'litespeed_purge_all', 'pedido do Claude' );
				return array( 'ok' => true, 'tudo' => true );
			}
			$urls = array_slice( (array) $pedido->get_param( 'urls' ), 0, 50 );
			foreach ( $urls as $u ) {
				do_action( 'litespeed_purge_url', home_url( '/' . ltrim( (string) $u, '/' ) ) );
			}
			return array( 'ok' => true, 'urls' => $urls );
		},
	) );
} );
