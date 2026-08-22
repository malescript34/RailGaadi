module.exports = {
  ci: {
    collect: { startServerCommand: "npm run start", startServerReadyPattern: "Ready", url: ["http://localhost:3000/"] },
    assert: { assertions: { "categories:performance": ["error", { minScore: 0.85 }], "categories:accessibility": ["error", { minScore: 0.85 }], "categories:best-practices": ["error", { minScore: 0.85 }], "categories:seo": ["error", { minScore: 0.85 }] } },
    upload: { target: "temporary-public-storage" },
  },
};
