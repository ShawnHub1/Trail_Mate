export const mainController = {
  index: {
    handler: async function (request, h) {
      return h.view("main");
    },
  },
};
