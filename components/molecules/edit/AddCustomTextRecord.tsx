import { Button, CheckSVG, CrossSVG, Input } from "@ensdomains/thorin";
import React, { useState } from "react";
import { Tab, useFields } from "./FieldsContext";

enum ButtonType {
  ADD_RECORD,
  ADDING_RECORD,
}

interface AddCustomTextRecordProps {
  tab: Tab;
}

const AddCustomTextRecord = ({ tab }: AddCustomTextRecordProps) => {
  const [buttonType, setButtonType] = useState(ButtonType.ADD_RECORD);
  const [fieldName, setFieldName] = useState("");
  const { addField } = useFields();

  const handleAddField = () => {
    addField(tab, fieldName);
    setButtonType(ButtonType.ADD_RECORD);
  };

  if (buttonType === ButtonType.ADD_RECORD) {
    return (
      <div className="w-full">
        <Button onClick={() => setButtonType(ButtonType.ADDING_RECORD)}>
          Add Custom
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center gap-4">
      <Input
        hideLabel
        label=""
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      />
      <div className="flex rounded-lg border border-gray-200">
        <button
          onClick={() => {
            setButtonType(ButtonType.ADD_RECORD);
          }}
          className="p-4"
        >
          <CrossSVG className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={handleAddField}
          className="border-l border-gray-200 p-4"
        >
          <CheckSVG className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default AddCustomTextRecord;
