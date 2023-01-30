# Tech Note

---

## Intro

---

This document is going to trace the code forked from [Material UI](https://github.com/devias-io/material-kit-react). And the techniques or tools used in the code will be shown and even explained here. Due to the limitation of the page and time, this document will not dive into the detailed stuff and would rather take care the most important techniques and those worth mentioning.

## Keywords

---

- [React](#react)
- [NEXT.js](#nextjs)
- [Material UI](#material_ui)
- [Emotion](#emotion)
  - [CSS-in-JS](#css_in_js)
  - [emotion with NEXT.js SSR](#emotion_with_nextjs)
  - [CSS selector](#css_selector)
    - [nth-child selector](#nth_child)

- [Redux](https://redux.js.org/)

- [SSG, CSR, SSR](#ssg_csr_ssr)

## <a name="react"></a>React

---

[React](https://reactjs.org/) is a JavaScript **library** for buiding user interfaces. Please note that it is a **LIBRARY** not a framework. Here is a interesting [article](https://blog.bitsrc.io/why-is-react-a-library-and-next-js-a-framework-and-which-is-better-cee342bdfe8c) talking about this.

> There is a neaty [tutorial](https://nextjs.org/learn/foundations/about-nextjs?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=next-website) provided by NEXT.js. It takes you briefly go through the key contents of React.

## <a name="nextjs"></a>NEXT.js

---

[NEXT.js](https://nextjs.org/) is a **framework** for production which means it provides several useful ready-to-use tools to mitigate the pain point met in production app, but NEXT.js is still written in React and use the methods of React.

### <a name="SSR"></a>Key Feature 1. Server-Side Rendering

NEXT.js supports **Server-Side Rendering**(SSR) out-of-the-box. And here is the question what [SSR](https://medium.com/tiny-code-lessons/client-side-static-and-server-side-rendering-e2769c381c09) is. SSR is a blance between Static Rendering(STR) and Client-Side Rendering(CSR) which fetches the requested data from DB only at the time of receiving request from client and then render the HTML contents from server side for client. STR is the fatest route to get a better response time for the interaction at client side, but it will not work if the content on the web application is dynamic and needs to change frequently. CSR is the most flexible way to deal with dynamic content, but it is also the slowest one due to the cost of time to request these dynamic contents from server. In general, CSR is not recommended. Another drawback in CSR comes from SEO. CSR sends nearly empty HTML to client. This would be the barrier for SEO robot to analyze your webpage. SSR and STR are both capable of rendering essential contents in HTML to browser.

### Key Feature 2. File-Based Routing

Routing lets your web app can have multiple pages on it, and users can simply click on the tabs or buttons to switch between these pages. React supports routing on the browser without requiring extra requests to server for the webpage contents, but React needs some setup in the code to fulfill this function. NEXT.js lets programmer build routing only with files and folders instead of code. In a nutshell, routing in NEXT.js can be done with less code, less work, and more readable than in React.

### Key Feature 3. Fullstack Capabilities

NEXT.js can easily add backend code run on node.js to the app, such as REST API, storing data, and getting data, that kind of stuff can be added into NEXT.js project.

### Main Structure in NEXT.js Project

- [Default Page](#default_page)
- components
  - [layout](#layout)
- Pages
  - [_app.js](#_app.js)
    - [Override default theme](#override_default_theme)
    - [Add server-side rendered CSS](#add_ssr_css)
  - [_document.js](#_document.js)
    - [Customize renderPage](#customize_renderpage)
- contexts
- [theme](#theme) - *override default theme setting*s
- utils
  - [create-emotion-cache.js](#create-emotion-cache)

- [next.config.js](#next_config)
  - [Redirects](#redirects)
- [getInitialProps](#getInitialProps)

### <a name="default_page"></a>Default Page

The first page shows at user's browser comes from `index.js` in `pages` folder. If you wanna change default page to another one like `login.js`, this can be done by modifying `next.config.js` explained in this [section](#next_config).

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

#### <a name="override_default_theme"></a>Override default theme

To override default theme settings, the MUI template puts the customized theme settings in [theme](#theme) folder in the root level of project. And the index.js file under theme folder uses `createTheme` function provided by MUI to generate a MUI-typed `theme` object. Then this `theme` object will be injected in _app.js by wrapping components with a `ThemeProvider` component involved from MUI library.

#### <a name="add_ssr_css"></a>Add server-side rendered CSS

In order to add server-side rendered CSS for server-side rendering, there are three files to add/customize.

- <a name="create-emotion-cache"></a>`./util/create-emotion-cache.js`
- `./_app.js`
- `./_document.js`

These are all about the [pre-rendering](https://nextjs.org/docs/basic-features/pages#pre-rendering) and, by default, NEXT.js pre-renders every pages. It means NEXT.js generates HTML for each page in advance, instead of having it all done at client-side. In addition, each pre-rendered HTML involves only minimal and necessary JavaScript code, and the rest of contents are rendered at client side.

And there's a good [article](https://blog.logrocket.com/getting-started-with-mui-and-next-js/) talking in depth about how to setup the environment for MUI to work with NEXT.js.

First, `create-emotion-cache` file implements the `createCache` function coming from emotion library to let user manipulate the low-level style configuration, which is intended to be used with `<CacheProvider/>` component to override the default cache. For instance, the format of `createCache` is as shown below. The `key` option in the `object` is going to be the prefix before the class names of the css,

```react
import createCache from '@emotion/cache'

export const myCache = createEmotionCache({
  key: 'my-prefix-key',
  stylisPlugins: [
    /* your plugins here */
  ]
})
```

and be set as the value in `data-emotion` attribute on the `<style/>` tag as shown below, a code snippet of `_document.js`. The value of `key` option is coming with 	style	object and introduced by `style.key`, and then the related customized attributes like `data-emotion` and `key` are embedded in the `<style/>` tags as the initial HTML style setting for sever-side pre-rendering.

```jsx
const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  };
```

Next, the cache created in the first step will be implemented in `_app.js` and take control over default css style setting by the component `<CacheProvider/>`. It's easy to recognize that, in the `<CacheProvider/>` component, there's an attribute called `value` and assigned with the result of calling the `createEmotionCache` function done in previous step.

```JSX
import "../styles/globals.css";
import { ThemeProvider } from "@mui/material";
import { theme } from "../utils/theme";
import createEmotionCache from "../utils/create-emotion-cache";
import { CacheProvider } from "@emotion/react";

const clientSideEmotionCache = createEmotionCache();

function MyApp({
 Component,
 emotionCache = clientSideEmotionCache,
 pageProps,
}) {
 return (
   <CacheProvider value={emotionCache}>
     <ThemeProvider theme={theme}>
       <Component {...pageProps} />
     </ThemeProvider>
   </CacheProvider>
 );
}

export default MyApp;
```

Lastly, we need to tell server to render the correct styles before sending the pre-rendered HTML to client. And this will be done in `_document.js`. There's a[ `getInitialProps`](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props) function which also uses the `cacheEmotionCache` function from the first step to retrieve the customize styles. `getInitialProps` enables server-side rendering and send the page with the data already rendered from server.

```JSX
import { Children } from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '../utils/create-emotion-cache';

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

CustomDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () => originalRenderPage({
    enhanceApp: (App) => (props) => (
      <App
        emotionCache={cache}
        {...props}
      />
    )
  });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  };
};

export default CustomDocument;
```



### <a name="_document.js"></a>_document.js

> **Note:** The `Document` that we discuss here might relate to an HTML document, which is also known as **DOM**, in short of Document Object Model.
>
> ![DOM img](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/DOM-model.svg/1024px-DOM-model.svg.png)

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

### <a name="customize_renderpage"></a>Customize `renderPage`

> **Note:** This is advanced and only needed for libraries like CSS-in-JS like [emotion](#emotion) to support server-side rendering. This is not needed for built-in `styled-jsx` support.
>
> **Note:** The official document recommend avoiding customizing `getInitialProps` and `renderPage`, if possible.



### <a name="theme"></a>theme

The file in the theme folder, in MUI template, this file is index.js. And it exports a MUI-typed `theme` object created by function `createTheme` included from `@mui/material` package. This `theme` object is going to be implemented in customizing [_app.js] to [override the default theme](#override_default_theme) settings with the ones defined in `theme` object.

The part of code snippet is as shown below:

```react
import { createTheme } from '@mui/material';

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1200,
      xl: 1920
    }
  },
});
```

The last thing to apply those changes is to wrap the components with `ThemeProvider`, which is involved from `@mui/material` package, in _app.js. This `ThemeProvider` will handle the injection of the customized theme to App.

### <a name="next_config"></a>next.config.js

To [customize the configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction) of NEXT.js, you can create a `next.config.js` or `next.config.mjs` file in the root of the project. And it looks like the following example:

```js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
}

module.exports = nextConfig
```



### <a name="redirects"></a>Redirects

If you demand to [change default page](https://stackoverflow.com/questions/63357131/how-to-set-default-page-in-next-js) shows at use's browser, `redirects` allows you to redirect incoming request path to a different destination path. It looks like the following example code:

```js
module.exports = {
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
    ]
  },
}
```

\- `source` is the incoming request path.

\- `destination` is the path you want to route to.

\- `permanent` is used to tell client/search engines to cache the redirected page or not. If `true`, NEXT.js uses 308 status code to instruct clients/search engines to cache this redirected page forever. If `false`, 307 status code is going to be used and no cache.

### <a name="getInitialProps"></a>getInitialPrps

[getInitialProps](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props) use [SSR](#SSR) to do **initial data population** and will disable [Automatic Static Optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization).

In general usage,

```jsx
function Page({ stars }) {
  return <div>Next stars: {stars}</div>
}

Page.getInitialProps = async (ctx) => {
  const res = await fetch('https://api.github.com/repos/vercel/next.js')
  const json = await res.json()
  return { stars: json.stargazers_count }
}

export default Page
```

For the class component,

```jsx
import React from 'react'

class Page extends React.Component {
  static async getInitialProps(ctx) {
    const res = await fetch('https://api.github.com/repos/vercel/next.js')
    const json = await res.json()
    return { stars: json.stargazers_count }
  }

  render() {
    return <div>Next stars: {this.props.stars}</div>
  }
}

export default Page
```

`getInitialProps` is used to asynchronously fetch some data, which then populates `props`. And the `ctx` received as as the input of `getInitialProps` is the abbreviation for context which is an object with following properties:

\- `pathname` - Current route. That is the path of the page in `/pages`
\- `query` - Query string section of URL parsed as an object
\- `asPath` - `String` of the actual path (including the query) shown in the browser
\- `req` - [HTTP request object](https://nodejs.org/api/http.html#http_class_http_incomingmessage) (server only)
\- `res` - [HTTP response object](https://nodejs.org/api/http.html#http_class_http_serverresponse) (server only)
\- `err` - Error object if any error is encountered during the rendering

> NOTE:
>
> \- `getInitialProps` will run on both server and client. During page initial load, `getInitialProps` runs on server. When client navigates to different page via `next/link`, `getInitialProps` then runs on client.
>
> \- If `getInitialProps` is used in `_app.js` and `getServerSideProps is implemented  in to the page being navigated as well, then `getInitialProps` will run on server.
>
> 

## <a name="material_ui"></a>Material UI
---

[Material UI](https://mui.com/)(MUI) is a library of React UI components that implements Google's [Material Design](https://m2.material.io/). Material UI is comprehensive in that it comes packaged with default styles, and is optimized to work with [Emotion](#emotion). MUI provides production-ready components like buttons, alerts, menus, tables, and much more.

## <a name="emotion"></a>emotion
---

[emotion](https://emotion.sh/docs/introduction) is a library designed for writing css styles with JavaScript.

### <a name="css_in_js"></a>CSS-in-JS

Here is a great article that talks about the [CSS v.s. CSS-in-JS](https://blog.logrocket.com/css-vs-css-in-js/). **CSS-in-JS**, in a nutshell, is an external layer of functionality that allows you to write CSS properties for componets through JavaScript, and it is said to deal with the render-blocking latency issue and scoping issue when there are same class names occuring simultaneously in some of the CSS files on the same project.

Besides, the CSS-in-JS libraries used in React and React Native development to allow programmers to construct and manage styles in a component are called [**styled-components**](https://blog.logrocket.com/how-style-react-router-links-styled-components/).

### <a name="emotion_with_nextjs"></a>emotion with NEXT.js SSR

To use emotion's SSR with Next.js you need a custom `Document` component in `pages/_document.js` that renders the styles and inserts them into the `<head>`. [An example of Next.js with emotion can be found in the Next.js repo](https://github.com/vercel/next.js/tree/master/examples/with-emotion-vanilla).

```jsx
// ./pages/_document.js

import Document, { Html, Head, Main, NextScript } from 'next/document'
import * as React from 'react'
import { renderStatic } from '../shared/renderer'
export default class AppDocument extends Document {
  static async getInitialProps(ctx) {
    const page = await ctx.renderPage()
    const { css, ids } = await renderStatic(page.html)
    const initialProps = await Document.getInitialProps(ctx)
    return {
      ...initialProps,
      styles: (
        <React.Fragment>
          {initialProps.styles}
          <style
            data-emotion={`css ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        </React.Fragment>
      ),
    }
  }

  render() {
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
}
```

### <a name="css_selector"></a>CSS Selector

[Selectors](https://www.w3.org/TR/selectors/#selector) are patterns that match against elements in a tree, and as such form one of several technologies that can be used to select nodes in a document. They are a core component of CSS (Cascading Style Sheets), which uses Selectors to bind style properties to elements in the document.

> A [selector](https://www.w3.org/TR/selectors/#overview) represents a structure. This structure can be used as a condition (e.g. in a CSS rule) that determines which elements a selector matches in the document tree, or as a flat description of the HTML or XML fragment corresponding to that structure.

#### <a name="nth_child"></a>nth-child selector

The [`:nth-child`](https://css-tricks.com/almanac/selectors/n/nth-child/) selector allows you to select one or more elements based on their source order, according to a formula. In other words, `:nth-child` selector let you select elements in HTML like the elements in list, `<li>`, without adding extra class name in each tags in HTML and then CSS file can directly manipulate the styles of each elements that match the pattern defined in selector. The examples are as shown below:

```css
/* Select the first list item */
li:nth-child(1) { }

/* Select the 5th list item */
li:nth-child(5) { }

/* Select every other list item starting with first */
li:nth-child(odd) { }

/* Select every 3rd list item starting with first */
li:nth-child(3n - 2) { }

/* Select every 3rd list item starting with 2nd */
li:nth-child(3n - 1) { }

/* Select every 3rd child item, as long as it has class "el" */
.el:nth-child(3n) { }
```

## <a name="sag_csr_ssr"></a>SSG, CSR, SSR, and ISR

---

In order to improve the following pain points existing in web world, 

- latency of user interaction
- search engine optimization
- get most recent content

there are at least four tactics to deal with these issues, such as

- **SSG**: Static Site Generation
- **CSR**: Client Side Rendering
- **SSR**: Server Side Rendering
- **ISR**: Incremental Static Regeneration

And there is an [article](https://dev.to/pahanperera/visual-explanation-and-comparison-of-csr-ssr-ssg-and-isr-34ea) discussing about the comparison between these techniques.

One image to explain the comparison,

![img comparison](https://res.cloudinary.com/practicaldev/image/fetch/s--bXHuAxci--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8onh7r5sxmss9f87k726.png)



### Learning Resources

- [Official Tutorial](https://nextjs.org/learn/foundations/about-nextjs?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=next-website)