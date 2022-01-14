import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import formatDate from '../utils/formatDate';

import Header from '../components/Header';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function handlePagination() {
    if (posts.next_page === null) {
      console.log('Não há próxima página.');
      return;
    }

    const newPage = await fetch(posts.next_page).then(response =>
      response.json()
    );

    const newPosts = newPage.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.last_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts({
      next_page: newPage.next_page,
      results: [...posts.results, ...newPosts],
    });
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {posts.results.map(post => (
          <div key={post.uid} className={styles.homeContent}>
            <Link href={`/post/${post.uid}`}>
              <h1>{post.data.title}</h1>
            </Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.homeStylesAuthors}>
              <p>
                <FiCalendar size={20} />
                {formatDate(post.first_publication_date)}
              </p>
              <p>
                <FiUser size={20} />
                {post.data.author}
              </p>
            </div>
          </div>
        ))}
        {posts.next_page && (
          <div className={styles.loadMorePosts}>
            <button onClick={() => handlePagination()}>
              Carregar mais posts
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page ? postsResponse.next_page : '0',
        results: posts,
      },
    },
  };
};
