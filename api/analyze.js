const analyze = async () => {
  try {
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: scans,
        occasion: occ,
        glam,
        faceDNA: createFaceDNA({ profile, occ, glam, hasFullScan }),
      }),
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!res.ok) {
      alert("API Error: " + (data.error || "Unknown error"));
      setLoading(false);
      return;
    }

    // ✅ SAVE RESULT
    setResult(data);

    // 💥 FORCE NAVIGATION (THIS WAS MISSING)
    setTab("lumi");   // ← this is your RESULTS tab

  } catch (err) {
    console.error(err);
    alert("Something went wrong: " + err.message);
  } finally {
    setLoading(false);
  }
};
