import { LoginCommand } from 'src/commands/auth/login';
import { LogoutCommand } from 'src/commands/auth/logout';
import { OauthCommand } from 'src/commands/auth/oauth';
import { RegisterCommand } from 'src/commands/auth/register';

export const AuthCommand = async (action, options: any) => {
	if (action === 'logout') return await LogoutCommand(options);
	if (action === 'oauth') return await OauthCommand(options);
	if (action === 'register') return await RegisterCommand(options);
	return await LoginCommand(options);
};

export * from 'src/commands/auth/login';
export * from 'src/commands/auth/logout';
export * from 'src/commands/auth/oauth';
export * from 'src/commands/auth/register';
