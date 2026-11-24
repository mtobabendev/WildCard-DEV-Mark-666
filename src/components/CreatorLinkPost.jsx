import './CreatorLinkPost.css'

export default function CreatorLinkPost({ desktop = false }) {
  return <article className={desktop ? 'ah-desktop__post' : 'penny-fans__featured-post'} aria-label="Ashley creator spotlight">
    <a className="creator-link-post" href="/ashley/what-if">
      <span className="creator-link-post__mark" aria-hidden="true">♠</span>
      <span className="creator-link-post__text"><small>WILDCARD DEV · CREATOR SPOTLIGHT</small><strong>Ashley</strong><span>Visit Ashley’s page ↗</span></span>
    </a>
  </article>
}
