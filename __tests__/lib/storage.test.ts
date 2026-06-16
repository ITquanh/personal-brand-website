// Mock @vercel/blob
const mockPut = jest.fn();
const mockDel = jest.fn();
const mockList = jest.fn();

jest.mock('@vercel/blob', () => ({
  put: mockPut,
  del: mockDel,
  list: mockList,
}));

import { uploadFile, deleteFile, listFiles, uploadImage, uploadMarkdown } from '@/lib/storage';

describe('storage.ts - 文件存储', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('UT-STO-01: 文件上传应返回 URL', async () => {
      mockPut.mockResolvedValueOnce({ url: 'https://blob.example.com/test.txt' });
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const url = await uploadFile(file, 'test.txt');
      expect(url).toBe('https://blob.example.com/test.txt');
      expect(mockPut).toHaveBeenCalledWith('test.txt', file, { access: 'public' });
    });

    it('UT-STO-06: 上传失败应抛出错误', async () => {
      mockPut.mockRejectedValueOnce(new Error('Upload failed'));
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      await expect(uploadFile(file, 'test.txt')).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    it('UT-STO-02: 文件删除应调用 del', async () => {
      mockDel.mockResolvedValueOnce(undefined);
      await deleteFile('https://blob.example.com/test.txt');
      expect(mockDel).toHaveBeenCalledWith('https://blob.example.com/test.txt');
    });
  });

  describe('listFiles', () => {
    it('UT-STO-03: 文件列表应返回 blobs 数组', async () => {
      const mockBlobs = [{ url: 'https://blob.example.com/1.txt' }];
      mockList.mockResolvedValueOnce({ blobs: mockBlobs });
      const result = await listFiles('images/');
      expect(result).toEqual(mockBlobs);
      expect(mockList).toHaveBeenCalledWith({ prefix: 'images/' });
    });

    it('UT-STO-03b: 无 prefix 时应列出所有文件', async () => {
      mockList.mockResolvedValueOnce({ blobs: [] });
      await listFiles();
      expect(mockList).toHaveBeenCalledWith({ prefix: undefined });
    });
  });

  describe('uploadImage', () => {
    it('UT-STO-04: 图片上传应生成唯一文件名', async () => {
      mockPut.mockResolvedValueOnce({ url: 'https://blob.example.com/images/test.jpg' });
      const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });
      const url = await uploadImage(file);
      expect(url).toBe('https://blob.example.com/images/test.jpg');
      expect(mockPut).toHaveBeenCalledWith(
        expect.stringMatching(/^images\/\d+-\w+\.jpg$/),
        file,
        { access: 'public' }
      );
    });
  });

  describe('uploadMarkdown', () => {
    it('UT-STO-05: Markdown 上传应生成带时间戳的文件名', async () => {
      mockPut.mockResolvedValueOnce({ url: 'https://blob.example.com/markdown/test.md' });
      const file = new File(['# Hello'], 'test.md', { type: 'text/markdown' });
      const url = await uploadMarkdown(file);
      expect(url).toBe('https://blob.example.com/markdown/test.md');
      expect(mockPut).toHaveBeenCalledWith(
        expect.stringMatching(/^markdown\/\d+-test\.md$/),
        file,
        { access: 'public' }
      );
    });
  });
});
