import React from 'react';
import Image from "next/image";

import css from "@/styles/sections/articles/recent.module.scss";

interface Article {
  id: string;
  pubDate: string;
  thumbnail: string;
  link: string;
  title: string;
  author: string;
}

interface MediumArticles {
  items: Article[];
}

interface RecentProps {
  mediumArticles: MediumArticles;
}

export default function Recent({ mediumArticles }: RecentProps) {
  const articles = mediumArticles.items;

  return (
    <section>
      <div className='container'>
        <section className={css.projects}>
          {articles.map((article) => {
            const date = new Date(article.pubDate).toDateString();
            return (
              <article key={article.id} className={css.project}>
                <span className={css.featuredImage}>
                  <Image
                    src={article.thumbnail}
                    alt="Article thumbnail"
                    width={500}
                    height={300}
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </span>
                <span className={css.header}>
                  <a href={article.link} rel="noreferrer" target="_blank">
                    {article.title} {" "}
                    <span className={css.link}>Read More</span>
                  </a>
                </span>
                <span className={css.descriptionContainer}></span>
                <span className={css.details}>
                  <p>By {article.author}</p>
                  <p className={css.pushedAt}>{date}</p>
                </span>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}