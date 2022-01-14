import { GetStaticPaths, GetStaticProps } from 'next';
import { useState } from 'react';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import formatDate from '../../utils/formatDate';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps ) {
  const [fullPost, setFullPost] = useState<Post>(post);
  const { isFallback } = useRouter();

  const totalWords = post.data.content.reduce((accumulator, content) => {
    accumulator += content.heading.split(' ').length;
    const words = content.body.map(item => item.text.split(' ').length);
    words.map(word => (accumulator += word));
    return accumulator;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header />
      <img src={fullPost.data.banner.url} alt="post-logo" width="100%" height="400px" />
      <div className={styles.postContainer}>
        <h1 className={styles.postTitle}>{fullPost.data.title}</h1>
        <div className={styles.postInfos}>
          <p>
            <FiCalendar />
            {formatDate(fullPost.first_publication_date)}
          </p>
          <p>
            <FiUser />
            {fullPost.data.author}
          </p>
          <p>
            <FiClock />{readTime+' min'}
          </p>
        </div>
          {fullPost.data.content.map(c => (
            <div className={styles.postContent} key={c.heading}>
              <h1 className={styles.postTitle}>{c.heading}</h1>

            <div dangerouslySetInnerHTML={{
              __html: RichText.asHtml(c.body),
            }} />
            </div>
          ))}
      </div>
    </>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug'],
    }
  );

  const params = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const slug = context.params.slug;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const { content } = response.data;

  // console.log(content.map(c => {
  //     console.log(c.heading);
  //     c.body.map(b => {
  //       console.log(b)
  //       b.spans.map(d => {
  //         console.log(d.data)
  //       });
  //     })
  // }));

  const post: PostProps = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
    first_publication_date: response.first_publication_date,
    uid: response.uid,
  };

  console.log(post);

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
