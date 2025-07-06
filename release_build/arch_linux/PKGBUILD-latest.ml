§ import { package_info, package_name, release, shell_escape } from './info.js';
	__ESM_PROCESS_CONTEXT__.short_filter_stack.push(shell_escape);

pkgname=«package_info.name»
pkgver=«package_info.version»
pkgrel=1
pkgdesc=«package_info.description»
arch=('any')
url=«package_info.homepage»
license=('custom')
depends=('nodejs' 'npm')
source=("$pkgname-$pkgver.tgz::https://github.com/efforting-tech/$pkgname/releases/download/v$pkgver/$pkgname-$pkgver.tgz")
sha256sums=(«release.sha256()»)

package() {
  npm install -g --prefix="$pkgdir/usr" "$srcdir/$pkgname-$pkgver.tgz"

  # Optional: install license
  #install -Dm644 "$srcdir/package/license.txt" "$pkgdir/usr/share/licenses/$pkgname/license.txt"
}
