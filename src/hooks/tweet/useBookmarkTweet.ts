import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api, RouterOutputs } from "../../utils/api";
import { objectId } from "../../utils/utilityFunctions";

interface Props {
  queryClient: QueryClient;
  userID: string;
}

export default function useBookmarkTweet({ queryClient, userID }: Props) {
  const { mutate } = api.tweet.bookmarkTweet.useMutation({
    // * When mutate is called:
    onMutate: async ({ bookmarkID, twitterID, newBookmarkID }) => {
      // * Cancel any outgoing refetches
      // * (so they don't overwrite the optimistic update)
      await queryClient.cancelQueries({
        queryKey: [
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ],
      });

      // * Snapshot the previous value
      const previousTweets = <RouterOutputs["tweet"]["getTweets"]>(
        queryClient.getQueryData([
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ])
      );

      // * Optimistically update to the new value
      queryClient.setQueryData(
        [
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ],
        (old: RouterOutputs["tweet"]["getTweets"] | undefined) => {
          if (old === undefined) {
            return old;
          }
          return [
            ...old.map((d) =>
              d.id === twitterID
                ? bookmarkID
                  ? {
                      ...d,
                      Bookmark: [],
                      _count: { ...d._count, Bookmark: d._count.Bookmark - 1 },
                    }
                  : {
                      ...d,
                      _count: { ...d._count, Bookmark: d._count.Bookmark + 1 },
                      Bookmark: [
                        {
                          id: newBookmarkID,
                          tweetId: twitterID,
                          userId: userID,
                        },
                      ],
                    }
                : { ...d }
            ),
          ];
        }
      );

      // * Return a context object with the snapshotted value
      return { previousTweets };
    },
    // * If the mutation fails,
    // * use the context returned from onMutate to roll back
    onError: (err, newTweet, context) => {
      console.log(err);
      toast.error("Server error! Please try again later????");
      queryClient.setQueryData(
        [
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ],
        context?.previousTweets
      );
    },
    // * Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          ["tweet", "getTweets"],
          {
            type: "query",
          },
        ],
      });
    },
  });

  return { mutate };
}
