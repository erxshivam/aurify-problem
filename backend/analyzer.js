const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (url) => {
  try {
    const start = Date.now();
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(data);
    const loadTime = Date.now() - start;

    const title = !!$("title").text().trim();
    const description = !!$('meta[name="description"]').attr("content")?.trim();
    const h1 = $("h1").length;
    const canonical = !!$('link[rel="canonical"]').attr("href");
    const lang = !!$("html").attr("lang");
    const viewport = $('meta[name="viewport"]').attr("content");
    const images = $("img").length;
    const alt = $("img[alt]").length;

    const checks = [
      [title, 20, "Missing page title"],
      [description, 20, "Missing meta description"],
      [h1 === 1, 15, h1 ? "Multiple H1 headings" : "Missing H1 heading"],
      [canonical, 10, "Missing canonical URL"],
      [lang, 10, "Missing HTML language attribute"],
      [!images || alt / images >= 0.8, 10, "Images are missing alt text"],
      [$("a").length > 0, 15, "No links detected"],
    ];

    const issues = checks.filter(([ok]) => !ok);

    return {
      scores: {
        seo: checks.reduce((score, [ok, weight]) => score + (ok ? weight : 0), 0),
        mobile: !viewport ? 40 : /width\s*=\s*device-width/i.test(viewport) ? 100 : 70,
      },
      loadTime,
      issue: issues[0]?.[2] || "No major technical issue detected",
      additionalIssues: Math.max(issues.length - 1, 0),
    };
  } catch (err) {
    if (err.response?.status === 403)
      throw new Error("This website doesn't allow automated analysis.");
    if (err.code === "ECONNABORTED")
      throw new Error("Website took too long to respond.");
    throw new Error("Unable to analyze this website.");
  }
};