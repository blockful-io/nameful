import { FieldsProvider, useFields } from "@/components/molecules";

import { ProfileHeader } from "@/components/organisms/ProfileHeader";
import TabBody from "@/components/organisms/TabBody";
import { UserDomainCard } from "@/components/organisms/UserDomainCard";
import { DomainData, getENSDomainData } from "@/lib/domain-page";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";

import { Button, Heading, Skeleton, SkeletonGroup } from "@ensdomains/thorin";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PublicClient, zeroAddress } from "viem";
import { usePublicClient } from "wagmi";

export const excludeKeys = [
  "com.twitter",
  "org.telegram",
  "com.linkedin",
  "avatar",
  "com.github",
  "email",
  "description",
  "name",
  "url",
];

export function ManageNamePageContent({ name }: { name: string }) {
  const [ensData, setEnsData] = useState<DomainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateEditModalFieldsWithEnsData } = useFields();
  const publicClient = usePublicClient();

  const handleFetchENSDomainData = async () => {
    setIsLoading(true);

    if (!publicClient) {
      toast.error("No public client found. Please contact our team.");
      return;
    }

    try {
      const data = await getENSDomainData({
        domain: name,
        client: publicClient as ClientWithEns & PublicClient,
      });

      setEnsData(data);
      updateEditModalFieldsWithEnsData(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setEnsData(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    handleFetchENSDomainData();
  }, [name]);

  // if we have an error while loading the domain data, we show a message
  if (!ensData && error) {
    return (
      <div className="m-auto mt-[200px] flex w-full max-w-[1216px] flex-col items-center justify-center">
        <Heading level="2" as="h3" className="p-4 text-center text-black">
          😵
          <br /> We had an error when loading this domain data
        </Heading>
        <Button
          onClick={() => window.location.reload()}
          colorStyle="blueSecondary"
          className="mt-5"
        >
          Try again?
        </Button>
      </div>
    );
  }

  if (!ensData && !isLoading) {
    return (
      <div className="m-auto mt-[200px] flex w-full max-w-[1216px] flex-col items-center justify-center">
        <Heading level="2" as="h3" className="p-4 text-center text-black">
          👀
          <br /> This domain is not yet registered
        </Heading>
        <Link href={`/register/${name}`} className="mt-5">
          <Button colorStyle="blueSecondary">Want to register it?</Button>
        </Link>
      </div>
    );
  }

  const resolver = ensData?.resolver;
  const textRecords = resolver?.texts;

  return (
    <div className="flex flex-col items-center justify-start bg-white text-black">
      <ProfileHeader />

      <SkeletonGroup loading={isLoading}>
        <div className="w-full p-[60px]">
          <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-7">
            <div className="flex w-full gap-[60px]">
              <Skeleton>
                <UserDomainCard
                  owner={ensData?.owner}
                  name={name}
                  avatar={textRecords?.avatar}
                  url={textRecords?.url}
                  description={textRecords?.description}
                  email={textRecords?.["email"]}
                  github={textRecords?.["com.github"]}
                  twitter={textRecords?.["com.twitter"]}
                  linkedIn={textRecords?.["com.linkedin"]}
                  onRecordsEdited={handleFetchENSDomainData}
                  resolverAddress={ensData?.resolver.address || zeroAddress}
                />
              </Skeleton>

              <TabBody
                domainData={ensData}
                fetchDomainData={handleFetchENSDomainData}
              />
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}

export async function getServerSideProps({
  params,
}: {
  params: { name: string };
}) {
  return {
    props: {
      name: params.name,
    },
  };
}

export default function ManageNamePage({ name }: { name: string }) {
  return (
    <FieldsProvider>
      <ManageNamePageContent name={name} />
    </FieldsProvider>
  );
}
