\c wc_news_test

SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles
LEFT JOIN comments 
ON articles.article_id=comments.article_id
WHERE articles.article_id=1
GROUP BY articles.article_id;