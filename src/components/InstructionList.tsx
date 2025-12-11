export const InstructionList = () => (
  <div className="card">
    <h2>How to get your Instagram data</h2>
    <ol className="steps">
      <li>Open Instagram → Settings → Your Activity → Download Your Information.</li>
      <li>Request Download → choose JSON → confirm.</li>
      <li>After you receive the email, download the .zip file.</li>
      <li>Extract and locate <code>followers_1.json</code> and <code>following.json</code>.</li>
      <li>Drop the files (or the zip) here to analyze locally.</li>
    </ol>
    <div className="placeholder">Screenshot placeholder</div>
  </div>
)
