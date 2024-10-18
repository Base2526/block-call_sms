import React from "react";
import { Text, TextStyle, GestureResponderEvent } from "react-native";

// Define the props for Mention component
interface MentionProps {
  mentionHashtagColor?: string;
  mentionHashtagPress?: (text: string) => void;
  text: string;
}

// Define the props for MentionHashtagTextView component
interface MentionHashtagTextViewProps {
  children: string; // Assuming children is a string
  style?: TextStyle;
  onPress?: (event: GestureResponderEvent) => void;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip"; // Ellipsize mode options
  mentionHashtagPress?: (text: string) => void;
  mentionHashtagColor?: string;
}

const Mention: React.FC<MentionProps> = (props) => {
  return (
    <Text
      style={{
        color: props.mentionHashtagColor ? props.mentionHashtagColor : "#0384BE",
      }}
      onPress={() => {
        if (props.mentionHashtagPress) {
          props.mentionHashtagPress(props.text);
        }
      }}
    >
      {props.text}
    </Text>
  );
};

const MentionHashtagTextView: React.FC<MentionHashtagTextViewProps> = (props) => {
  const prepareText = (text: string, mentionHashtagPress?: (text: string) => void, mentionHashtagColor?: string) => {
    const result: (string | JSX.Element)[] = [];

    const mentList = text.match(/[@#][a-z0-9_\.]+/gi); // Use the provided children instead of props.children
    if (mentList === null) {
      return [text];
    }
    for (const ment of mentList) {
      result.push(text.substring(0, text.indexOf(ment)));
      result.push(
        <Mention
          key={ment} // Add a key for the array item
          mentionHashtagColor={mentionHashtagColor}
          mentionHashtagPress={mentionHashtagPress}
          text={ment}
        />
      );
      text = text.substring(text.indexOf(ment) + ment.length, text.length);
    }
    if (text.length > 0) {
      result.push(text);
    }
    return result;
  };

  return (
    <Text
      style={props.style}
      onPress={props.onPress}
      numberOfLines={props.numberOfLines}
      ellipsizeMode={props.ellipsizeMode}
    >
      {prepareText(
        props.children,
        props.mentionHashtagPress,
        props.mentionHashtagColor
      )}
    </Text>
  );
};

export default MentionHashtagTextView;
