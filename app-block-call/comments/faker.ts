import { faker } from '@faker-js/faker';

// Define the interfaces
interface SubComment {
  _id: string;
  comment: string;
  timestamp: number;
  username: string;
  secondReply: string | null;
}

interface Comment {
  _id: string;
  comment: string;
  timestamp: number;
  username: string;
  exposed: boolean;
  subComments: Array<SubComment>;
}

// Function to generate a single SubComment
const generateSubComment = (): SubComment => {
  return {
    _id: faker.string.uuid(),
    comment: faker.lorem.sentence(),
    timestamp: Date.now(),
    username: faker.internet.userName(),
    secondReply: Math.random() > 0.5 ? faker.lorem.sentence() : null,
  };
};

// Function to generate multiple SubComments
const generateSubComments = (count: number): SubComment[] => {
  return Array.from({ length: count }, () => generateSubComment());
};

// Function to generate a single Comment
const generateComment = (): Comment => {
  const subCommentCount = Math.floor(Math.random() * 5); // Generate up to 5 sub-comments
  return {
    _id: faker.string.uuid(),
    comment: faker.lorem.paragraph(),
    timestamp: Date.now(),
    username: faker.internet.userName(),
    exposed: Math.random() > 0.5,
    subComments: generateSubComments(subCommentCount),
  };
};

// Function to generate multiple Comments
const generateComments = (count: number): Comment[] => {
  return Array.from({ length: count }, () => generateComment());
};

// export default generateComments;

// Example usage
// const commentsData = generateComments(10); // Generate 10 comments
// console.log(commentsData);

export default generateComments;

// // Example usage
// const commentsData = generateComments(10); // Generate 10 comments
// console.log(commentsData);
