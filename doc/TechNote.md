# Trace code

---

## Intro

---

This document is going to trace the code forked from [Material UI](https://github.com/devias-io/material-kit-react). And the techniques or tools used in the code will be shown and even explained here. Due to the limitation of the page and time, this document will not dive into the detailed stuff and would rather take care the most important techniques and those worth mentioning.

## Keywords

---

- [React](https://reactjs.org/)
- [NEXT.js](https://nextjs.org/)
- [Material UI](https://mui.com/)
- [Emotion](https://emotion.sh/docs/introduction)
- [Redux](https://redux.js.org/)

## React

---

React is a JavaScript **library** for buiding user interfaces. Please note that it is a **LIBRARY** not a framework. Here is a interesting [article](https://blog.bitsrc.io/why-is-react-a-library-and-next-js-a-framework-and-which-is-better-cee342bdfe8c) talking about this.

> There is a neaty [tutorial](https://nextjs.org/learn/foundations/about-nextjs?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=next-website) provided by NEXT.js. It takes you briefly go through the key contents of React.

## NEXT.js

---

NEXT.js is a **framework** for production which means it provides several useful ready-to-use tools to mitigate the pain point met in production app, but NEXT.js is still written in React and use the methods of React.

### Key Feature 1. Server-Side Rendering

NEXT.js supports **Server-Side Rendering**(SSR) out-of-the-box. And here is the question what [SSR](https://medium.com/tiny-code-lessons/client-side-static-and-server-side-rendering-e2769c381c09) is. SSR is a blance between Static Rendering(STR) and Client-Side Rendering(CSR) which fetches the requested data from DB only at the time of receiving request from client and then render the HTML contents from server side for client. STR is the fatest route to get a better response time for the interaction at client side, but it will not work if the content on the web application is dynamic and needs to change frequently. CSR is the most flexible way to deal with dynamic content, but it is also the slowest one due to the cost of time to request these dynamic contents from server. In generalm CSR is not recommended. Another drawback in CSR comes from SEO. CSR sends nearly empty HTML to client. This would be the barrier for SEO robot to analyze your webpage. SSR and STR are both capable of rendering essential contents in HTML to browser.

### Key Feature 2. File-Based Routing

Routing lets your web app can have multiple pages on it, and users can simply click on the tabs or buttons to switch between these pages. React supports routing on the browser without requiring extra requests to server for the webpage contents, but React needs some setup in the code to fulfill this function. NEXT.js lets programmer build routing only with files and folders instead of code. In a nutshell, routing in NEXT.js can be done with less code, less work, and more readable than in React.

### Key Feature 3. Fullstack Capabilities

NEXT.js can easily add backend code run on node.js to the app, such as REST API, storing data, and getting data, that kind of stuff can be added into NEXT.js project.

### Key Structure in NEXT.js Project

- entry point
- components
  - [layout](#layout)
- Pages
  - [_app.js](#_app.js)
  - [_document.js](#_document.js)
- contexts
- theme
- utils
- [next.config.js](#next_config)
  - [Base Path](#base_path)

- 

### <a name="layout" ></a>layout

React allows us to reuse common componets between pages, and in the same concept, we also can inplement the reusable or global [layout](https://nextjs.org/docs/basic-features/layouts) for pages. Beside, by using shared layout, the page state (input values, scroll position, etc.) will be persisted. There's a layout example as shown below:

```jsx
// components/layout.js

import Navbar from './navbar'
import Footer from './footer'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

`children` represents the content beteen  those opening `Layout` tag and closing `Layout` tag which is a JSX expression and the deta	information can be found in [Children in JSX](https://reactjs.org/docs/jsx-in-depth.html#children-in-jsx). By the way, `children` is the property inside `props` object, which also can be access via `props.children`. The following instance shows that the `Componet` tag wrapped with `Layout` tag will be stored in `props` as a property of `children`.

```JSX
<Layout>
  <Component {...pageProps} />
</Layout>
```

 And there are two use cases that can be taken as examples.


#### Single shared layout with [_app.js](#_app.js)

```jsx
// pages/_app.js

import Layout from '../components/layout'

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
```

In this case, `Component` represents the active page in NEXT.js, so the content of this page is going to be wrapped arround by `Layout` template.

#### Per-Page Layouts

If you need mutiple layouts for different pages, you can add a method `getLayout` in the page, which allows different pages having their own customized layout design and returning their own layout at _app.js by function call.

 ```JSX
 // pages/index.js
 
 import Layout from '../components/layout'
 import NestedLayout from '../components/nested-layout'
 
 export default function Page() {
   return (
     /** Your content */
   )
 }
 
 Page.getLayout = function getLayout(page) {
   return (
     <Layout>
       <NestedLayout>{page}</NestedLayout>
     </Layout>
   )
 }
 ```

```JSX
// pages/_app.js

export default function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page)

  return getLayout(<Component {...pageProps} />)
}
```

### <a name="_app.js"></a>_app.js

To override the default App and customize it, the first step is to create the file `./pages/_app.js` as shown below:

```jsx
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

The `Component` prop is the active page, so whenever you navigate to different `page` `Component` will change to this new `page`. Therefore, any props you mentioned in `Component`, like `pageProps` here, will be received by the `page`.

`pageProps` is an object with initial props which were rendered by one of the [data fetching methods](https://nextjs.org/docs/basic-features/data-fetching/overview) like SSR, CSR, SSG, and dynamic routing.

### <a name="_document.js"></a>_document.js

To override the default `Document`, create the file `pages/_document.js as shown below:

```JSX
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

A custom `Document` can modify `<html>` and `<body>` tags used to render a page. This file is only rendered on server, so the event handlers for interaction like `onClick` are supposed not to be included in `_document`.

Another instance to explain the usage of custom `Document` is the snippet code from Material UI template as show below. It shows that there are few fonts, icons, and theme color being added in `<Head>`.

```JSX
class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto+Slab|Roboto:300,400,500,700&display=optional"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            href="/favicon.ico"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <meta
            name="theme-color"
            content="#111827"
          />
        </Head>
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}
```

### <a name="next_config"></a>next.config.js



### <a name="base_path"></a>Base Path



### Learning Resources

- [Official Tutorial](https://nextjs.org/learn/foundations/about-nextjs?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=next-website)