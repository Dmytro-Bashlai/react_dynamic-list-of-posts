import React, { useEffect, useState } from "react";
import classNames from "classnames";

import "bulma/css/bulma.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "./App.scss";

import { client } from "./utils/fetchClient";
import { Loader } from "./components/Loader";
import { UserSelector } from "./components/UserSelector";
import { PostsList } from "./components/PostsList";
import { PostDetails } from "./components/PostDetails";

import { User } from "./types/User";
import { Post } from "./types/Post";
import { Comment, CommentData } from "./types/Comment";
import { Notification } from "./enums/Notification";

export const App = () => {
  const [users, setUsers] = useState<User[] | []>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[] | []>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(Notification.Initial);

  const [comments, setComments] = useState<Comment[] | []>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsNotification, setCommentsNotification] = useState(
    Notification.Initial,
  );

  useEffect(() => {
    client.get<User[]>("/users").then(setUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setNotification(Notification.Initial);
      setLoading(true);

      client
        .get<Post[]>(`/posts?userId=${selectedUser.id}`)
        .then((postsFromServer) => {
          if (postsFromServer.length === 0) {
            setNotification(Notification.WarningPosts);
          }

          setPosts(postsFromServer);
        })
        .catch(() => {
          setNotification(Notification.LoadingError);
          setPosts([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedPost) {
      setCommentsNotification(Notification.Initial);
      setCommentsLoading(true);

      client
        .get<Comment[]>(`/comments?postId=${selectedPost.id}`)
        .then((commentsFromServer) => {
          if (commentsFromServer.length === 0) {
            setCommentsNotification(Notification.WarningComments);
          }

          setComments(commentsFromServer);
        })
        .catch(() => {
          setCommentsNotification(Notification.LoadingError);
          setComments([]);
        })
        .finally(() => setCommentsLoading(false));
    }
  }, [selectedPost]);

  function addComment(newComment: CommentData) {
    return client
      .post<Comment>("/comments", { ...newComment, postId: selectedPost?.id })
      .then((commentFromServer) => {
        setComments((currentComments) => [
          ...currentComments,
          commentFromServer,
        ]);
        setCommentsNotification(Notification.Initial);

        return commentFromServer;
      })
      .catch(() => {
        setCommentsNotification(Notification.LoadingError);

        throw new Error();
      });
  }

  function deleteComment(commentId: number) {
    setCommentsNotification(Notification.Initial);
    const prevComments = comments;
    const filteredComments = comments.filter(
      (comment) => comment.id !== commentId,
    );

    if (filteredComments.length > 0) {
      setComments(filteredComments);
    } else {
      setCommentsNotification(Notification.WarningComments);
    }

    return client
      .delete(`/comments/${commentId}`)
      .then(() => {
        setComments(filteredComments);
      })
      .catch(() => {
        setComments(prevComments);
        setCommentsNotification(Notification.LoadingError);
      });
  }

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  users={users}
                  selectedUser={selectedUser}
                  onChangeUser={(userToSelect: User) => {
                    if (userToSelect && userToSelect.id !== selectedUser?.id) {
                      setSelectedUser(userToSelect);
                      setSelectedPost(null);
                    }
                  }}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUser && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {loading && <Loader />}

                {!loading && notification === Notification.LoadingError && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    {notification}
                  </div>
                )}

                {!loading && notification === Notification.WarningPosts && (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    {notification}
                  </div>
                )}

                {!loading && !notification && (
                  <PostsList
                    posts={posts}
                    postId={selectedPost?.id}
                    onSelectPost={(postToSelect: Post | null) => {
                      if (
                        postToSelect &&
                        postToSelect.id === selectedPost?.id
                      ) {
                        setSelectedPost(null);
                      } else {
                        setSelectedPost(postToSelect);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              "tile",
              "is-parent",
              "is-8-desktop",
              "Sidebar",
              { "Sidebar--open": selectedPost },
            )}
          >
            <div className="tile is-child box is-success ">
              {selectedPost && (
                <PostDetails
                  selectedPost={selectedPost}
                  comments={comments}
                  notification={commentsNotification}
                  loading={commentsLoading}
                  onDeleteComment={(commentId) => deleteComment(commentId)}
                  onAddComment={(newComment: CommentData) =>
                    addComment(newComment)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
