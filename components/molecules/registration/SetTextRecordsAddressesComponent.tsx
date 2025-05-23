import { BackButton, NextButton } from "@/components/atoms";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { Input } from "@ensdomains/thorin";
import { useAccount } from "wagmi";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
interface SetTextRecordsAddressesComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

type Address = {
  address: string;
  isValid: boolean;
};

export type Addresses = {
  [key: string]: Address;
};

export const convertAddressesToRecord = (
  addresses: Addresses,
): Record<string, string> => {
  return Object.keys(addresses).reduce(
    (acc, key) => {
      acc[key] = addresses[key].address;
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const SetTextRecordsAddressesComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsAddressesComponentProps) => {
  const { setDomainAddresses, nameRegistrationData } = useNameRegistration();
  const { address } = useAccount();
  const [addresses, setAddresses] = useState<Addresses>({
    ETH: { address: "", isValid: true },
  });

  const anyInvalidAddresses = (): boolean => {
    return Object.keys(addresses).some(
      (key) =>
        !isAddress(addresses[key].address) && addresses[key].address !== "",
    );
  };

  // will only run when NextButton is pressed and there is some invalid address
  const validateAddressesInputs = () => {
    const updatedAddresses = Object.keys(addresses).reduce((acc, key) => {
      const address = addresses[key].address;

      acc[key] = {
        ...addresses[key],
        isValid: isAddress(address),
      };
      return acc;
    }, {} as Addresses);

    setAddresses(updatedAddresses);
  };

  useEffect(() => {
    if (address) {
      setAddresses({
        ETH: { address, isValid: true },
      });
    }
  }, [address]);

  useEffect(() => {
    const domainsAddressesKeys = Object.keys(
      nameRegistrationData.domainAddresses,
    );
    if (domainsAddressesKeys.length > 0) {
      const addresses = domainsAddressesKeys.reduce((acc, key) => {
        return {
          ...acc,
          [key]: {
            address: nameRegistrationData.domainAddresses[key],
            isValid: true,
          },
        };
      }, {});
      setAddresses(addresses);
    }
  }, []);

  const saveDomainAddressesInLocalStorage = (
    domainAddresses: Record<string, string>,
  ) => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        domainAddresses,
      });
    }
  };
  return (
    <div className="flex w-full flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <div>
          <p className="text-start text-sm font-bold text-[#9b9ba7]">
            Profile settings
          </p>
          <h1 className="text-[30px] font-bold text-[#1E2122]">Addresses</h1>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mb-[10px] flex w-full flex-col space-y-[22px]"
        >
          {Object.keys(addresses).map((address) => (
            <div
              key={address}
              className="flex w-full flex-col items-start space-y-2 text-start"
            >
              {/* <div className="flex w-full items-center text-gray-400 justify-between">
                <button
                  className="flex items-center space-x-1 group"
                  onClick={() =>
                    setSocialAccountsAdded(
                      socialAccountsAdded.filter(
                        (existingSocialAccount) =>
                          existingSocialAccount !== socialAccount
                      )
                    )
                  }
                >
                  <CrossSVG className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition" />
                  <p className="font-semibold text-sm group-hover:text-gray-500 transition">
                    Remove
                  </p>
                </button>
              </div> */}
              <Input
                clearable
                type="text"
                id={address}
                label={address}
                placeholder="Your address"
                disabled={!!nameRegistrationData.asPrimaryName}
                value={addresses[address].address}
                onChange={(e) =>
                  setAddresses((prevAddresses) => ({
                    ...prevAddresses,
                    [address]: {
                      isValid: true,
                      address: e.target.value,
                    },
                  }))
                }
                error={!addresses[address].isValid && "Invalid address"}
              />
            </div>
          ))}
          {/* <Button prefix={<PlusSVG />} colorStyle="blueSecondary" onClick={}>
            Add account
          </Button> */}
        </form>
      </div>
      <div className="flex w-[500px]">
        <NextButton
          onClick={() => {
            if (!anyInvalidAddresses()) {
              setDomainAddresses(convertAddressesToRecord(addresses));
              saveDomainAddressesInLocalStorage(
                convertAddressesToRecord(addresses),
              );
              handleNextStep();
            } else {
              validateAddressesInputs();
            }
          }}
        />
      </div>
    </div>
  );
};
