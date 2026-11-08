export default function WorkspaceLoading() {
  return <div className="tlx-page tlx-page-loading" role="status" aria-live="polite">
    <div className="tlx-page-meta"><span>WORKSPACE / LOADING</span><span>PREPARING INVESTIGATION DATA</span></div>
    <div className="tlx-loading-label">✳ SYNCHRONIZING WORKSPACE</div>
    <div className="tlx-skeleton-title" aria-hidden="true"/><div className="tlx-skeleton-title short" aria-hidden="true"/>
    <div className="tlx-skeleton-grid" aria-hidden="true"><div/><div/><div/></div>
    <p>Retrieving your latest information securely.</p>
  </div>;
}
