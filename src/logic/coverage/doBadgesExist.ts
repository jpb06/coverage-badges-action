import { pathExists } from 'fs-extra';

export const doBadgesExist = async (outputPath: string): Promise<boolean> => {
  const files = [
    'coverage-branches.svg',
    'coverage-functions.svg',
    'coverage-total.svg',
    'coverage-lines.svg',
    'coverage-statements.svg',
  ];

  const exist = await Promise.all(
    files.map(async (file) => await pathExists(`${outputPath}/${file}`)),
  );

  return exist.every((el) => el);
};
