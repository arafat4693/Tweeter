import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api, RouterOutputs } from "../../utils/api";

interface Props {
  queryClient: QueryClient;
  userID: string;
}

export default function useLikeTweet({ queryClient, userID }: Props) {
  const { mutate } = api.tweet.likeTweet.useMutation({
    // * When mutate is called:
    onMutate: async ({ likeID, twitterID, newLikeID }) => {
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
                ? likeID
                  ? {
                      ...d,
                      likes: [],
                      _count: { ...d._count, likes: d._count.likes - 1 },
                    }
                  : {
                      ...d,
                      _count: { ...d._count, likes: d._count.likes + 1 },
                      likes: [
                        {
                          id: newLikeID,
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
