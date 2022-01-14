import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/Logo.svg';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div>
        <Link href="/">
          <a className={styles.headerContent}>
            <Image src="/Logo.svg" alt="logo" width="200" height="30" />
          </a>
        </Link>
      </div>
    </header>
  );
}
