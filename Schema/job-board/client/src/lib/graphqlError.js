/**
 * Map graphql-request ClientError (and friends) to messages users can read.
 * Raw `err.message` often appends a huge JSON dump — we prefer `response.errors[0]`.
 */
export function getGraphQLErrorInfo(err) {
  const graphQlErr = err?.response?.errors?.[0];
  if (graphQlErr) {
    const code = graphQlErr.extensions?.code ?? null;
    const { title, text, needsLogin } = textForCode(code, graphQlErr.message);
    return { title, text, needsLogin, code };
  }
  // Fallback: avoid dumping the entire request body
  const raw = String(err?.message ?? "");
  if (raw.length > 180) {
    return {
      title: "Something went wrong",
      text: "Please try again. If you are signing in, make sure you are logged in first.",
      needsLogin: false,
      code: null,
    };
  }
  return {
    title: "Something went wrong",
    text: raw || "Please try again.",
    needsLogin: false,
    code: null,
  };
}

function textForCode(code, serverMessage) {
  switch (code) {
    case "UNAUTHENTICATED":
      return {
        title: "Sign in required",
        text: "To delete or create jobs, sign in with an account from that company, then try again.",
        needsLogin: true,
      };
    case "FORBIDDEN":
      return {
        title: "Not allowed",
        text: "You can only manage jobs for your own company. Try a job posted by an employer you work for.",
        needsLogin: false,
      };
    case "NOT_FOUND":
      return {
        title: "Not found",
        text: "This job is no longer here. It may have been deleted already.",
        needsLogin: false,
      };
    case "BAD_USER_INPUT":
      return {
        title: "Check your input",
        text: serverMessage || "One or more fields are invalid. Please review the form and try again.",
        needsLogin: false,
      };
    default:
      return {
        title: "We couldn't complete that",
        text: serverMessage || "Please try again in a moment.",
        needsLogin: false,
      };
  }
}
