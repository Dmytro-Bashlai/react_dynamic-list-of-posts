import React, { useState } from "react";
import classNames from "classnames";
import { Comment, CommentData } from "../types/Comment";
import { FormNotification } from "../enums/FormNotification";

interface Props {
  onAddComment: (newComment: CommentData) => Promise<Comment>;
}

export const NewCommentForm: React.FC<Props> = ({ onAddComment }) => {
  const [name, setName] = useState("");
  const [errorName, setErrorName] = useState(FormNotification.Initial);

  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(FormNotification.Initial);

  const [body, setBody] = useState("");
  const [errorBody, setErrorBody] = useState(FormNotification.Initial);

  const [isLoading, setIsLoading] = useState(false);

  function handleClear() {
    setName("");
    setErrorName(FormNotification.Initial);
    setEmail("");
    setErrorEmail(FormNotification.Initial);
    setBody("");
    setErrorBody(FormNotification.Initial);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorName(FormNotification.Initial);
    setErrorEmail(FormNotification.Initial);
    setErrorBody(FormNotification.Initial);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedBody = body.trim();

    let isValidForm = true;

    if (!trimmedName) {
      setErrorName(FormNotification.RequiredName);
      isValidForm = false;
    }

    if (!trimmedEmail) {
      setErrorEmail(FormNotification.RequiredEmail);
      isValidForm = false;
    }

    if (!trimmedBody) {
      setErrorBody(FormNotification.RequiredBody);
      isValidForm = false;
    }

    if (!isValidForm) {
      return;
    }

    const newComment: CommentData = {
      name: trimmedName,
      email: trimmedEmail,
      body: trimmedBody,
    };

    setIsLoading(true);

    onAddComment(newComment)
      .then(() => setBody(""))
      .finally(() => setIsLoading(false));
  }

  return (
    <form data-cy="NewCommentForm" onSubmit={(e) => handleSubmit(e)}>
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="name"
            id="comment-author-name"
            placeholder="Name Surname"
            value={name}
            className={classNames("input", { "is-danger": errorName })}
            onChange={(e) => {
              setName(e.target.value);
              setErrorName(FormNotification.Initial);
            }}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>

          {errorName && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {errorName && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {FormNotification.RequiredName}
          </p>
        )}
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="email"
            id="comment-author-email"
            placeholder="email@test.com"
            value={email}
            className={classNames("input", { "is-danger": errorEmail })}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorEmail(FormNotification.Initial);
            }}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

          {errorEmail && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {errorEmail && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {FormNotification.RequiredEmail}
          </p>
        )}
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>

        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            placeholder="Type comment here"
            value={body}
            className={classNames("textarea", { "is-danger": errorBody })}
            onChange={(e) => {
              setBody(e.target.value);
              setErrorBody(FormNotification.Initial);
            }}
          />
        </div>

        {errorBody && (
          <p className="help is-danger" data-cy="ErrorMessage">
            {FormNotification.RequiredBody}
          </p>
        )}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={classNames("button is-link", {
              "is-loading": isLoading,
            })}
          >
            Add
          </button>
        </div>

        <div className="control">
          {/* eslint-disable-next-line react/button-has-type */}
          <button
            type="reset"
            className="button is-link is-light"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};
