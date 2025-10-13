import { builder } from '@builder.io/sdk';

builder.init(process.env.EXPO_PUBLIC_BUILDER_API_KEY!);

export async function getContent(model: string, options: any = {}) {
  return await builder
    .get(model, {
      ...options,
      userAttributes: {
        urlPath: '/', // you can later adjust if you want per-page content
      },
    })
    .toPromise();
}
