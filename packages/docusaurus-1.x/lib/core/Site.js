/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CWD = process.cwd();

const React = require('react');
const fs = require('fs');
const classNames = require('classnames');

const HeaderNav = (fs.existsSync(CWD + '/core/nav/HeaderNav.js'))
  ? require(CWD + '/core/nav/HeaderNav.js')
  : require('./nav/HeaderNav.js');
const Head = require('./Head.js');

const Footer = require(`${process.cwd()}/core/Footer.js`);
const translation = require('../server/translation.js');
const env = require('../server/env.js');
const liveReloadServer = require('../server/liveReloadServer.js');
const {idx, getPath} = require('./utils.js');


// Component used to provide same head, header, footer, other scripts to all pages
class Site extends React.Component {
  mobileNavHasOneRow(headerLinks) {
    const hasLanguageDropdown =
      env.translation.enabled && env.translation.enabledLanguages().length > 1;
    const hasOrdinaryHeaderLinks = headerLinks.some(
      link => !(link.languages || link.search),
    );
    return !(hasLanguageDropdown || hasOrdinaryHeaderLinks);
  }

  render() {
    const tagline =
      idx(translation, [this.props.language, 'localized-strings', 'tagline']) ||
      this.props.config.tagline;
    const title = this.props.title
      ? `${this.props.title} · ${this.props.config.title}`
      : (!this.props.config.disableTitleTagline &&
          `${this.props.config.title} · ${tagline}`) ||
        this.props.config.title;
    const description = this.props.description || tagline;
    const path = getPath(
      this.props.config.baseUrl + (this.props.url || 'index.html'),
      this.props.config.cleanUrl,
    );
    const url = this.props.config.url + path;
    let docsVersion = this.props.version;

    const liveReloadScriptUrl = liveReloadServer.getReloadScriptUrl();

    if (!docsVersion && fs.existsSync(`${CWD}/versions.json`)) {
      const latestVersion = require(`${CWD}/versions.json`)[0];
      docsVersion = latestVersion;
    }

    const navPusherClasses = classNames('navPusher', {
      singleRowMobileNav: this.mobileNavHasOneRow(
        this.props.config.headerLinks,
      ),
    });

    return (
      <html lang={this.props.language}>
        <Head
          config={this.props.config}
          description={description}
          title={title}
          url={url}
          language={this.props.language}
          version={this.props.version}
          noIndex={this.props.config.noIndex || this.props.metadata.noIndex}
        />
        <body
          className={classNames({
            [className]: className,
            separateOnPageNav: this.props.config.onPageNav == 'separate',
          })}>
          <div className="app">
            <HeaderNav
              config={this.props.config}
              baseUrl={this.props.config.baseUrl}
              title={this.props.config.title}
              language={this.props.language}
              version={this.props.version}
              current={this.props.metadata}
            />
            <div className={navPusherClasses}>
              {this.props.children}
              <Footer config={this.props.config} language={this.props.language} />
            </div>
            {this.props.config.algolia && (
              <script
                type="text/javascript"
                src="https://cdn.jsdelivr.net/docsearch.js/1/docsearch.min.js"
              />
            )}
            {this.props.config.gaTrackingId && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                ga('create', '${this.props.config.gaTrackingId}', 'auto');
                ga('send', 'pageview');
              `,
                }}
              />
            )}
            {this.props.config.facebookAppId && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.fbAsyncInit = function() {FB.init({appId:'${
                    this.props.config.facebookAppId
                  }',xfbml:true,version:'v2.7'});};(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s); js.id = id;js.src = '//connect.facebook.net/en_US/sdk.js';fjs.parentNode.insertBefore(js, fjs);}(document, 'script','facebook-jssdk'));
                  `,
                }}
              />
            )}
            {this.props.config.facebookPixelId && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${this.props.config.facebookPixelId}');
                fbq('track', 'PageView');
                  `,
                }}
              />
            )}
            {this.props.config.twitter && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.twttr=(function(d,s, id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return t;js=d.createElement(s);js.id=id;js.src='https://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js, fjs);t._e = [];t.ready = function(f) {t._e.push(f);};return t;}(document, 'script', 'twitter-wjs'));`,
                }}
              />
            )}
            {this.props.config.algolia &&
              (this.props.config.algolia.algoliaOptions ? (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                var search = docsearch({
                  ${
                    this.props.config.algolia.appId
                      ? `appId: '${this.props.config.algolia.appId}',`
                      : ''
                  }
                  apiKey: '${this.props.config.algolia.apiKey}',
                  indexName: '${this.props.config.algolia.indexName}',
                  inputSelector: '#search_input_react',
                  algoliaOptions: ${JSON.stringify(
                    this.props.config.algolia.algoliaOptions
                  )
                    .replace('VERSION', docsVersion)
                    .replace('LANGUAGE', this.props.language)}
                });
              `,
                  }}
                />
              ) : (
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                var search = docsearch({
                  ${
                    this.props.config.algolia.appId
                      ? `appId: '${this.props.config.algolia.appId}',`
                      : ''
                  }
                  apiKey: '${this.props.config.algolia.apiKey}',
                  indexName: '${this.props.config.algolia.indexName}',
                  inputSelector: '#search_input_react'
                });
              `,
                  }}
                />
              ))}
            {process.env.NODE_ENV === 'development' && liveReloadScriptUrl && (
              <script src={liveReloadScriptUrl} />
            )}
          </div>
        </body>
      </html>
    );
  }
}
module.exports = Site;
