const { allowCors, getEnv, handleOptions, json } = require("./_supabase");

module.exports = async (req, res) => {
  if (handleOptions(req, res)) {
    return;
  }

  allowCors(res);

  const env = getEnv();
  json(res, 200, {
    enabled: env.enabled,
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey
  });
};
