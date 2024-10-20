import { faker } from '@faker-js/faker';

import { CommentInterface, SubCommentInterface, UserCommentInterface, StatusInterface } from "./interfaces"

const generateUserComment = (): UserCommentInterface => {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    url: faker.image.avatar()
  };
};

// Function to generate a single SubComment
const generateSubComment = (): SubCommentInterface => {
  return {
    _id: faker.string.uuid(),
    text: faker.lorem.sentence(),
    user: generateUserComment(),
    status: StatusInterface.SENT,
    created: Date.now(),
    updated: Date.now(),
  };
};

// Function to generate multiple SubComments
const generateSubComments = (count: number): SubCommentInterface[] => {
  return Array.from({ length: count }, () => generateSubComment());
};

// Function to generate a single Comment
const generateComment = (): CommentInterface => {
  const subCommentCount = Math.floor(Math.random() * 5); // Generate up to 5 sub-comments
  return {
    _id: faker.string.uuid(),
    text: faker.lorem.paragraph(),
    created: Date.now(),
    updated: Date.now(),
    user: generateUserComment(),
    status: StatusInterface.SENT,
    // exposed: Math.random() > 0.5,
    subComments: generateSubComments(subCommentCount),
  };
};

// Function to generate multiple Comments
const generateComments = (count: number): CommentInterface[] => {
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
