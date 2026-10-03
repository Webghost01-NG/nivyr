<template>
  <div class="nivyr-home">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot"></span> Developer infrastructure · Zcash</p>
        <h1 id="home-title">Nivyr<span class="hero-period">.</span></h1>
        <p class="hero-subtitle">Integration testing for Zcash payment applications.</p>
        <p class="hero-description">
          Exercise the real path between broadcast, mining, indexing, wallet scanning, and application settlement.
          Keep every boundary visible in your TypeScript tests.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="/guide/getting-started">Get started <span aria-hidden="true">→</span></a>
          <a class="button button-quiet" href="https://github.com/Webghost01-NG/nivyr">GitHub <span aria-hidden="true">↗</span></a>
          <a class="button button-quiet" href="https://www.npmjs.com/package/@webghost01/nivyr">npm package status <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <aside class="quickstart" aria-label="Quickstart commands">
        <div class="quickstart-head"><span class="terminal-mark" aria-hidden="true">›_</span><span>quickstart</span><span class="runtime-pill">regtest</span></div>
        <pre><code><span class="shell-muted">$</span> npm install -D @webghost01/nivyr

<span class="shell-muted">$</span> npx nivyr doctor
<span class="shell-muted">$</span> npx nivyr up
<span class="shell-muted">$</span> npx nivyr test
<span class="shell-muted">$</span> npx nivyr down</code></pre>
        <p>npm publication is pending. Node.js + Docker Compose; no local Rust build in image mode.</p>
      </aside>
    </section>

    <section class="insight-band" aria-labelledby="insight-title">
      <div>
        <p class="eyebrow">The boundary that matters</p>
        <h2 id="insight-title">A mined payment is only one observer’s truth.</h2>
      </div>
      <p class="insight-quote">“A mined Zcash payment is not necessarily scanned, detected, enhanced, or settled.”</p>
      <div class="knowledge-chain" aria-label="Knowledge is separate across the chain, indexer, wallet and application">
        <span>chain</span><b aria-hidden="true">≠</b><span>indexer</span><b aria-hidden="true">≠</b><span>wallet</span><b aria-hidden="true">≠</b><span>application</span>
      </div>
    </section>

    <section class="lifecycle-section" aria-labelledby="lifecycle-title">
      <div class="section-heading">
        <p class="eyebrow">One payment · distinct states</p>
        <h2 id="lifecycle-title">Follow the payment, not just the txid.</h2>
        <p>Tests can pause at the boundaries and assert what each layer knows. Applications may use only the states relevant to their flow.</p>
      </div>
      <ol class="lifecycle-track">
        <li><span class="step-index">01</span><span>Broadcast</span></li>
        <li><span class="step-index">02</span><span>Mined</span></li>
        <li><span class="step-index">03</span><span>Indexed</span></li>
        <li><span class="step-index">04</span><span>Wallet<br />unscanned</span></li>
        <li><span class="step-index">05</span><span>Synced</span></li>
        <li><span class="step-index">06</span><span>Detected</span></li>
        <li><span class="step-index">07</span><span>Enhanced</span></li>
        <li><span class="step-index">08</span><span>Memo<br />available</span></li>
        <li><span class="step-index">09</span><span>App<br />settlement</span></li>
      </ol>
      <a class="text-link" href="/concepts/lifecycle">Understand lifecycle boundaries <span aria-hidden="true">→</span></a>
    </section>

    <section class="layers-section" aria-labelledby="layers-title">
      <div class="section-heading">
        <p class="eyebrow">Model the observers</p>
        <h2 id="layers-title">Knowledge moves through layers.</h2>
      </div>
      <div class="layer-grid">
        <article class="layer-card"><span class="layer-number">01</span><h3>Chain</h3><p>The transaction was broadcast and later included in an active block.</p><span class="layer-output">transaction state</span></article>
        <article class="layer-card"><span class="layer-number">02</span><h3>Indexer</h3><p>The block has reached the wallet-facing indexer and can be scanned.</p><span class="layer-output">indexed height</span></article>
        <article class="layer-card"><span class="layer-number">03</span><h3>Wallet</h3><p>The merchant wallet synced, detected the payment, and may need enhancement.</p><span class="layer-output">wallet observation</span></article>
        <article class="layer-card"><span class="layer-number">04</span><h3>Application</h3><p>The app reconciles the observed payment with its invoice rules.</p><span class="layer-output">settlement decision</span></article>
      </div>
    </section>

    <section class="proof-strip" aria-label="Current verification scope">
      <div><strong>20 / 20</strong><span>packaged lifecycle checks passed</span></div>
      <div><strong>Fedora 44</strong><span>x86_64 verified host</span></div>
      <div><strong>0</strong><span>Rust builds in image mode</span></div>
      <a href="/reference/evidence">Review the evidence <span aria-hidden="true">→</span></a>
    </section>

    <section class="next-steps" aria-labelledby="next-title">
      <div><p class="eyebrow">Build a more honest payment test</p><h2 id="next-title">Start with the layer your app relies on.</h2></div>
      <div class="next-links">
        <a href="/guide/first-lifecycle-test"><span>01</span> Write a lifecycle test <b aria-hidden="true">→</b></a>
        <a href="/guide/forged-txid"><span>02</span> Reproduce mined-only settlement <b aria-hidden="true">→</b></a>
        <a href="/concepts/architecture"><span>03</span> See how the runtime fits <b aria-hidden="true">→</b></a>
      </div>
    </section>
  </div>
</template>
