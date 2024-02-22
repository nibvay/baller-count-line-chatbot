const { CHANNEL_ACCESS_TOKEN } = process.env;

async function getUserProfile({ groupId, userId }) {
  const userProfile = await fetch(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
  }).then((response) => response.json());
  return userProfile;
}

module.exports = {
  getUserProfile,
};
