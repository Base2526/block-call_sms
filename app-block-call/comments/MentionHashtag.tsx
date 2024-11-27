import React from "react";
import { Text, TextStyle, GestureResponderEvent } from "react-native";

// Define the props for Mention component
interface MentionProps {
  mentionHashtagColor?: string;
  mentionHashtagPress?: (text: string) => void;
  text: string;
}

// Define the props for Url component
interface UrlProps {
  urlColor?: string;
  urlPress?: (url: string) => void;
  text: string;
}

// Define the props for MentionHashtagTextView component
interface MentionHashtagTextViewProps {
  children: string;
  style?: TextStyle;
  onPress?: (event: GestureResponderEvent) => void;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  mentionHashtagPress?: (text: string) => void;
  mentionHashtagColor?: string;
  urlColor?: string;
  urlPress?: (url: string) => void;
}

// Component to handle mentions and hashtags
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

// Component to handle URLs
const Url: React.FC<UrlProps> = (props) => {
  return (
    <Text
      style={{
        color: props.urlColor ? props.urlColor : "#1E90FF",
      }}
      onPress={() => {
        if (props.urlPress) {
          props.urlPress(props.text);
        }
      }}
    >
      {props.text}
    </Text>
  );
};

const MentionHashtagTextView: React.FC<MentionHashtagTextViewProps> = (props) => {
  const prepareText = (
    text: string,
    mentionHashtagPress?: (text: string) => void,
    mentionHashtagColor?: string,
    urlPress?: (url: string) => void,
    urlColor?: string
  ) => {
    const result: (string | JSX.Element)[] = [];

    // Regular expressions for mentions, hashtags, and URLs
    const mentionHashtagRegex = /[@#][a-z0-9_\.]+/gi;
    // Updated regex to include URLs starting with www.
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

    // Split text into parts based on mentions, hashtags, and URLs
    const parts = text.split(new RegExp(`(${mentionHashtagRegex.source}|${urlRegex.source})`, 'gi'));

    for (const part of parts) {
      if (mentionHashtagRegex.test(part)) {
        result.push(
          <Mention
            key={part}
            mentionHashtagColor={mentionHashtagColor}
            mentionHashtagPress={mentionHashtagPress}
            text={part}
          />
        );
      } else if (urlRegex.test(part)) {
        result.push(
          <Url
            key={part}
            urlColor={urlColor}
            urlPress={urlPress}
            text={part}
          />
        );
      } else {
        result.push(part);
      }
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
        props.mentionHashtagColor,
        props.urlPress,
        props.urlColor
      )}
    </Text>
  );
};

export default MentionHashtagTextView;