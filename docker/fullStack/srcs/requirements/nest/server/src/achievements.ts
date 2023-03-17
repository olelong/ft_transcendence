import { PrismaClient } from '@prisma/client';

interface Achievement {
  names: string[];
  descs: string[];
  imgs: string[];
  regex: RegExp;
}
const achievements = {
  addFriends: {
    names: [
      "You're not alone anymore!!",
      "Now you're getting popular.",
      'A star is born B)',
    ],
    descs: ['Add 1 friend.', 'Add 5 friends.', 'Add 15 friends.'],
    imgs: ['friend-bronze.png', 'friend-silver.png', 'friend-gold.png'],
    regex: /^Add (\d*) friends?\.$/,
  } as Achievement,
  winGames: {
    names: ["Beginner's luck?", 'Much to learn you still have.', 'Pong master'],
    descs: ['Win 5 games.', 'Win 15 games.', 'Win 50 games.'],
    imgs: ['win-bronze.png', 'win-silver.png', 'win-gold.png'],
    regex: /^Win (\d*) games?\.$/,
  } as Achievement,
  loseGames: {
    names: ['Are you awake?'],
    descs: ['3 games lost.'],
    imgs: ['lose.png'],
    regex: /^(3) games lost\.$/,
  } as Achievement,
  createChannel: {
    names: ['Socialize yourself ( •̀ᴗ•́ )و ̑̑ '],
    descs: ['Create a channel group.'],
    imgs: ['channel.png'],
    regex: /^Create a channel group\.$/,
  } as Achievement,
  rank1: {
    names: ['You are writing the Pong history'],
    descs: ['Become rank 1.'],
    imgs: ['top1.png'],
    regex: /^Become rank 1\.$/,
  } as Achievement,
  top3: {
    names: ["Mommy I'm on TV!"],
    descs: ['Be in the top 3.'],
    imgs: ['top3.png'],
    regex: /^Be in the top 3\.$/,
  } as Achievement,
};
export default achievements;

export async function createAchievements(prisma: PrismaClient): Promise<void> {
  await Promise.all(
    Object.values(achievements).map(async (achievement) => {
      for (let i = 0; i < achievement.names.length; i++) {
        console.log(achievement.descs[i]);
        await prisma.achievement.create({
          data: {
            name: achievement.names[i],
            desc: achievement.descs[i],
            img: '/image/achievements/' + achievement.imgs[i],
          },
        });
      }
    }),
  );
}
