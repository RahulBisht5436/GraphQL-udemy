// After the HTML page loads, fetch the greeting from the GraphQL server and show it.
window.onload = async function () {
  const data = await fetchGreeting();

  // GraphQL HTTP responses look like { data: { ... }, errors?: [...] }
  if (data?.data?.greeting) {
    console.log(data.data.greeting);
    // Put the string into the <b> element on the page
    document.querySelector("b").innerHTML = data.data.greeting;
  }
};

// Sends a POST request with a GraphQL query body and returns the parsed JSON.
async function fetchGreeting() {
  // Standard GraphQL-over-HTTP shape: document string + optional variables map
  const queryData = {
    query: `query {
            greeting
        }`,
    variables: {},
  };

  try {
    const res = await fetch("http://localhost:9000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryData),
    });

    const data = await res.json();
    return data; // Caller reads data.data.greeting on success
  } catch (err) {
    console.error(err);
  }
}
